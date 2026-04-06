import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function LeviesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId) redirect("/login");

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const levies = await db.levy.findMany({
    where: { estateId },
    orderBy: { createdAt: "desc" },
    include: {
      payments: {
        select: { amountKobo: true, status: true },
      },
    },
  });

  const enriched = levies.map((levy) => {
    const totalKobo = levy.payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amountKobo, 0);
    const paidCount = levy.payments.filter((p) => p.status === "PAID").length;
    const pendingCount = levy.payments.filter(
      (p) => p.status === "PENDING_REVIEW"
    ).length;
    return { ...levy, totalCollectedKobo: totalKobo, paidCount, pendingCount };
  });

  return (
    <div className="max-w-[900px] mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[18px] font-bold text-[var(--text)]">Levies</h1>
        <Link
          href="/levies/new"
          className="inline-flex items-center gap-1.5 bg-[var(--navy)] text-white text-[13px] font-semibold px-4 py-2 rounded-[var(--radius)] hover:bg-[#0a2246] transition-colors"
        >
          + New levy
        </Link>
      </div>

      {enriched.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)]">
          <EmptyState
            message="No levies yet."
            context="Create your first levy to start collecting from residents."
          />
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc]">
                {["Levy", "Amount", "Due Date", "Collected", "Paid / Total", "Status", ""].map(
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
              {enriched.map((levy) => (
                <tr
                  key={levy.id}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[#fafafa]"
                >
                  <td className="px-[14px] py-[12px]">
                    <Link
                      href={`/levies/${levy.id}`}
                      className="text-[13px] font-semibold text-[var(--text)] hover:text-[var(--navy)] hover:underline"
                    >
                      {levy.name}
                    </Link>
                    {levy.description && (
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-[200px] truncate">
                        {levy.description}
                      </div>
                    )}
                  </td>
                  <td className="px-[14px] py-[12px] text-[13px] font-semibold text-[var(--text)]">
                    {formatNaira(levy.amountKobo)}
                  </td>
                  <td className="px-[14px] py-[12px] text-[12px] text-[var(--text-muted)]">
                    {new Date(levy.dueDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {new Date(levy.dueDate) < new Date() &&
                      levy.status === "ACTIVE" && (
                        <span className="ml-1.5 text-[10px] font-semibold text-[var(--red)] bg-[var(--red-light)] px-1.5 py-0.5 rounded">
                          Overdue
                        </span>
                      )}
                  </td>
                  <td className="px-[14px] py-[12px] text-[13px] font-semibold text-[var(--green)]">
                    {formatNaira(levy.totalCollectedKobo)}
                  </td>
                  <td className="px-[14px] py-[12px] text-[12px] text-[var(--text-muted)]">
                    {levy.paidCount} / {levy.payments.length}
                    {levy.pendingCount > 0 && (
                      <span className="ml-1.5 text-[10px] font-semibold text-[var(--amber)] bg-[var(--amber-light)] px-1.5 py-0.5 rounded">
                        {levy.pendingCount} pending
                      </span>
                    )}
                  </td>
                  <td className="px-[14px] py-[12px]">
                    <LevyStatusBadge status={levy.status} />
                  </td>
                  <td className="px-[14px] py-[12px]">
                    <Link
                      href={`/levies/${levy.id}`}
                      className="text-[12px] text-[var(--navy)] hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LevyStatusBadge({ status }: { status: string }) {
  const styles =
    status === "ACTIVE"
      ? "bg-[var(--green-light)] text-[var(--green)]"
      : status === "DRAFT"
        ? "bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]"
        : "bg-[var(--border)] text-[var(--text-muted)]";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${styles}`}
    >
      {status === "ACTIVE" ? "Active" : status === "DRAFT" ? "Draft" : "Closed"}
    </span>
  );
}
