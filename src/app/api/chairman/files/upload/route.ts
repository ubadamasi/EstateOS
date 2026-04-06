import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { storeFile, FileUploadError } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id || session.user.role !== "ESTATE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const fileId = await storeFile({ file, uploadedById: session.user.id });
    return NextResponse.json({ fileId });
  } catch (err) {
    if (err instanceof FileUploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
