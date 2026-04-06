import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LevyActions } from "@/components/chairman/LevyActions";
import { PaymentReviewRow } from "@/components/chairman/PaymentReviewRow";

export default async function LevyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId) redirect("/login");

  const { id: levyId } = await params;
  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const levy = await db.levy.findUnique({
    where: { id: levyId },
    include: {
      payments: {
        include: {
          resident: { select: { id: true, name: true, unitId: true, email: true } },
        },
        orderBy: { resident: { unitId: "asc" } },
      },
    },
  });

  if (!levy || levy.estateId !== estateId) notFound();

  const totalKobo = levy.payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amountKobo, 0);
  const paidCount = levy.payments.filter((p) => p.status === "PAID").length;
  const pendingCount = levy.payments.filter(
    (p) => p.status === "PENDING_REVIEW"
  ).length;
  const unpaidCount = levy.payments.filter(
    (p) => p.status === "UNPAID"
  ).length;

  const pendingPayments = levy.payments.filter(
    (p) => p.status === "PENDING_REVIEW"
  );
  const otherPayments = levy.payments.filter(
    (p) => p.status !== "PENDING_REVIEW"
  );

  return (
    <div className="max-w-[900px] mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/levies"
              className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              ← Levies
            </Link>
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text)]">
            {levy.name}
          </h1>
          {levy.description && (
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
              {levy.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[13px] font-semibold text-[var(--text)]">
              {formatNaira(levy.amountKobo)} / unit
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[12px] text-[var(--text-muted)]">
              Due{" "}
              {new Date(levy.dueDate).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Activate / Close actions */}
        <LevyActions levyId={levy.id} status={levy.status} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Collected" value={formatNaira(totalKobo)} color="var(--green)" />
        <MiniStat label="Paid" value={String(paidCount)} />
        <MiniStat
          label="Pending review"
          value={String(pendingCount)}
          color={pendingCount > 0 ? "var(--amber)" : undefined}
        />
        <MiniStat
          label="Unpaid"
          value={String(unpaidCount)}
          color={unpaidCount > 0 ? "var(--red)" : undefined}
        />
      </div>

      {/* Pending review section */}
      {pendingPayments.length > 0 && (
        <section aria-label="Pending review" className="mb-6">
          <h2 className="text-[14px] font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--amber)] inline-block" />
            Pending Review ({pendingPayments.length})
          </h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)] divide-y divide-[var(--border)]">
            {pendingPayments.map((p) => (
              <PaymentReviewRow
                key={p.id}
                payment={{
                  id: p.id,
                  residentName: p.resident.name,
                  unitId: p.resident.unitId,
                  amountKobo: p.amountKobo,
                  receiptFileId: p.receiptFileId,
                  receiptUploadedAt: p.receiptUploadedAt?.toISOString() ?? null,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* All payments */}
      {levy.payments.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-8 text-center shadow-[var(--shadow)]">
          <p className="text-[14px] text-[var(--text-muted)]">
            {levy.status === "DRAFT"
              ? "Activate this levy to generate payment records for all residents."
              : "No payments yet."}
          </p>
        </div>
      ) : (
        <section aria-label="All payments">
          <h2 className="text-[14px] font-semibold text-[var(--text)] mb-3">
            All Residents
          </h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {["Unit", "Resident", "Amount", "Status", "Receipt"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] border-b border-[var(--border)]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {otherPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--border)] last:border-b-0 hover:bg-[#fafafa]"
                  >
                    <td className="px-[14px] py-[11px] text-[12px] font-semibold text-[var(--text-muted)]">
                      {p.resident.unitId}
                    </td>
                    <td className="px-[14px] py-[11px] text-[13px] text-[var(--text)]">
                      {p.resident.name}
                    </td>
                    <td className="px-[14px] py-[11px] text-[13px] font-semibold text-[var(--text)]">
                      {formatNaira(p.amountKobo)}
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <StatusBadge
                        status={
                          p.status === "UNPAID" &&
                          new Date(levy.dueDate) < new Date()
                            ? "overdue"
                            : p.status
                        }
                      />
                    </td>
                    <td className="px-[14px] py-[11px]">
                      {p.receiptFileId ? (
                        <a
                          href={`/api/files/${p.receiptFileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-[var(--navy)] hover:underline"
                        >
                          View receipt
                        </a>
                      ) : (
                        <span className="text-[12px] text-[var(--text-muted)]">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)]">
      <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-1">
        {label}
      </div>
      <div
        className="text-[20px] font-bold"
        style={{ color: color ?? "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}
