import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReceiptUploadButton } from "@/components/resident/ReceiptUploadButton";

export default async function MyLeviesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id || !session.user.estateId) redirect("/login");

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const resident = await db.resident.findFirst({
    where: { estateId, userId: session.user.id },
  });

  if (!resident) {
    return (
      <div className="max-w-[600px] mx-auto px-5 py-12 text-center">
        <p className="text-[15px] text-[var(--text-muted)]">
          Your account isn&apos;t linked to a unit yet. Contact your estate
          manager.
        </p>
      </div>
    );
  }

  const payments = await db.payment.findMany({
    where: { residentId: resident.id },
    include: {
      levy: {
        select: {
          name: true,
          description: true,
          dueDate: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const groupedByStatus = {
    unpaid: payments.filter(
      (p) => p.status === "UNPAID" || p.status === "PENDING_REVIEW"
    ),
    paid: payments.filter((p) => p.status === "PAID"),
    disputed: payments.filter((p) => p.status === "DISPUTED"),
  };

  return (
    <div className="max-w-[700px] mx-auto px-5 py-6">
      <h1 className="text-[18px] font-bold text-[var(--text)] mb-5">
        My Levies
      </h1>

      {payments.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)]">
          <EmptyState
            message="No levies assigned."
            context="Your estate manager will assign levies to your unit."
          />
        </div>
      ) : (
        <>
          {/* Outstanding / Pending */}
          {groupedByStatus.unpaid.length > 0 && (
            <section className="mb-6">
              <h2 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-3">
                Outstanding
              </h2>
              <div className="space-y-3">
                {groupedByStatus.unpaid.map((p) => (
                  <PaymentCard
                    key={p.id}
                    payment={p}
                    showUpload={p.status === "UNPAID"}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Paid */}
          {groupedByStatus.paid.length > 0 && (
            <section className="mb-6">
              <h2 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-3">
                Paid
              </h2>
              <div className="space-y-3">
                {groupedByStatus.paid.map((p) => (
                  <PaymentCard key={p.id} payment={p} showUpload={false} />
                ))}
              </div>
            </section>
          )}

          {/* Disputed */}
          {groupedByStatus.disputed.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-3">
                Disputed
              </h2>
              <div className="space-y-3">
                {groupedByStatus.disputed.map((p) => (
                  <PaymentCard key={p.id} payment={p} showUpload={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function PaymentCard({
  payment,
  showUpload,
}: {
  payment: {
    id: string;
    amountKobo: number;
    status: string;
    receiptFileId: string | null;
    receiptUploadedAt: Date | null;
    reviewNote: string | null;
    levy: {
      name: string;
      description: string | null;
      dueDate: Date;
      status: string;
    };
  };
  showUpload: boolean;
}) {
  const isOverdue =
    payment.status === "UNPAID" && new Date(payment.levy.dueDate) < new Date();

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[var(--text)]">
              {payment.levy.name}
            </span>
            <StatusBadge
              status={
                isOverdue
                  ? "overdue"
                  : (payment.status as import("@/generated/prisma").PaymentStatus)
              }
            />
          </div>
          {payment.levy.description && (
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              {payment.levy.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[15px] font-bold text-[var(--text)]">
              {formatNaira(payment.amountKobo)}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Due{" "}
              {new Date(payment.levy.dueDate).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Receipt already uploaded — pending review */}
      {payment.status === "PENDING_REVIEW" && (
        <div className="mt-3 flex items-center gap-2 text-[12px] text-[var(--amber)]">
          <span>Receipt submitted</span>
          {payment.receiptFileId && (
            <a
              href={`/api/files/${payment.receiptFileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--navy)] hover:underline"
            >
              View →
            </a>
          )}
          <span className="text-[var(--text-muted)]">
            — waiting for confirmation
          </span>
        </div>
      )}

      {/* Review note after rejection */}
      {payment.status === "UNPAID" && payment.reviewNote && (
        <div className="mt-3 text-[12px] text-[var(--red)] bg-[var(--red-light)] px-3 py-2 rounded">
          Receipt rejected: {payment.reviewNote}. Please re-upload.
        </div>
      )}

      {/* Upload receipt button */}
      {showUpload && payment.levy.status === "ACTIVE" && (
        <div className="mt-3">
          <ReceiptUploadButton paymentId={payment.id} />
        </div>
      )}

      {/* Paid — show receipt if available */}
      {payment.status === "PAID" && payment.receiptFileId && (
        <div className="mt-2">
          <a
            href={`/api/files/${payment.receiptFileId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[var(--navy)] hover:underline"
          >
            View receipt →
          </a>
        </div>
      )}
    </div>
  );
}
