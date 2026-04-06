import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFile } from "@/lib/storage";

/**
 * GET /api/files/[id]
 *
 * Serves a stored file. Requires an authenticated session.
 * Platform admins can access any file.
 * Estate managers and residents can only access files belonging to their estate.
 *
 * The file is streamed directly from PostgreSQL bytea.
 * Content-Disposition: inline — opens in browser (image/PDF viewer).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorised", { status: 401 });
  }

  const { id } = await params;
  const file = await getFile(id);

  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Estate-scoped access check:
  // Residents and managers may only access files tied to their own estate.
  // This check is intentionally conservative — if the file can't be linked to
  // the user's estate, deny access. Platform admins bypass.
  if (session.user.role !== "PLATFORM_ADMIN") {
    const estateId = session.user.estateId;
    if (!estateId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const linked = await isFileLinkedToEstate(id, estateId);
    if (!linked) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return new NextResponse(file.data, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.sizeBytes),
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.fileName)}"`,
      // Browsers may cache the file for 1 hour — it never changes
      "Cache-Control": "private, max-age=3600",
    },
  });
}

/**
 * Verify a file is accessible within a given estate by checking all three
 * possible parent records (payment receipt, expense receipt, dispute proof).
 */
async function isFileLinkedToEstate(
  fileId: string,
  estateId: string
): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");

  const [payment, expense, dispute] = await Promise.all([
    prisma.payment.findFirst({
      where: { receiptFileId: fileId, estateId },
      select: { id: true },
    }),
    prisma.expense.findFirst({
      where: { receiptFileId: fileId, estateId },
      select: { id: true },
    }),
    prisma.dispute.findFirst({
      where: { proofFileId: fileId, estateId },
      select: { id: true },
    }),
  ]);

  return !!(payment || expense || dispute);
}
