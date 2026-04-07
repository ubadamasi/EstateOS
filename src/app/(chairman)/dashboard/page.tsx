import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { AlertStrip } from "@/components/ui/AlertStrip";
import { TrustBanner } from "@/components/ui/TrustBanner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryDot } from "@/components/ui/CategoryDot";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNaira } from "@/lib/format";

export default async function ChairmanDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.estateId) {
    if (session.user.role === "PLATFORM_ADMIN") {
      return (
        <div className="max-w-[900px] mx-auto px-5 py-12 text-center">
          <p className="text-[18px] font-bold text-[#0f172a] mb-2">Platform Admin</p>
          <p className="text-[14px] text-[#64748b]">No estate assigned. Use this account to manage the platform.</p>
        </div>
      );
    }
    redirect("/login");
  }

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const [estate, levies, recentExpenses, pendingPayments, openDisputes] =
    await Promise.all([
      db.estate.findUnique({ where: { id: estateId } }),
      db.levy.findMany({
        where: { estateId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          _count: {
            select: {
              payments: { where: { status: "PAID" } },
            },
          },
          payments: { select: { amountKobo: true, status: true } },
        },
      }),
      db.expense.findMany({
        where: { estateId },
        orderBy: { postedAt: "desc" },
        take: 10,
      }),
      db.payment.count({
        where: { estateId, status: "PENDING_REVIEW" },
      }),
      db.dispute.count({
        where: { estateId, status: "OPEN" },
      }),
    ]);

  if (!estate) redirect("/login");

  // Compute summary stats
  const totalCollectedKobo = await db.payment.aggregate({
    where: { estateId, status: "PAID" },
    _sum: { amountKobo: true },
  });

  const totalExpensesKobo = await db.expense.aggregate({
    where: { estateId },
    _sum: { amountKobo: true },
  });

  const totalCollected = totalCollectedKobo._sum.amountKobo ?? 0;
  const totalExpenses = totalExpensesKobo._sum.amountKobo ?? 0;
  const netBalance = totalCollected - totalExpenses;

  return (
    <>
      <AlertStrip
        pendingReviews={pendingPayments}
        openDisputes={openDisputes}
      />

      <div className="max-w-[1200px] mx-auto px-5 py-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Collected"
            value={formatNaira(totalCollected)}
            valueColor="var(--green)"
          />
          <StatCard
            label="Total Expenses"
            value={formatNaira(totalExpenses)}
            valueColor="var(--red)"
          />
          <StatCard
            label="Net Balance"
            value={formatNaira(netBalance)}
            valueColor={netBalance >= 0 ? "var(--text)" : "var(--red)"}
          />
          <StatCard
            label="Pending Reviews"
            value={String(pendingPayments)}
            valueColor={pendingPayments > 0 ? "var(--amber)" : "var(--text)"}
          />
        </div>

        {/* Two-column on desktop, single on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Levy Ledger */}
          <section aria-label="Levy ledger">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-[#0f172a]">
                Levy Ledger
              </h2>
              <a
                href="/levies/new"
                className="text-[13px] font-semibold text-[#0f2d5c] hover:underline"
              >
                + New levy
              </a>
            </div>

            {levies.length === 0 ? (
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg shadow-sm">
                <EmptyState
                  message="No levies created yet."
                  context="Create your first levy to start collecting from residents."
                  action={{ label: "Create levy", href: "/levies/new" }}
                />
              </div>
            ) : (
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc]">
                      <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                        Levy
                      </th>
                      <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                        Amount
                      </th>
                      <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                        Paid
                      </th>
                      <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {levies.map((levy) => {
                      const paidCount = levy._count.payments;
                      return (
                        <tr
                          key={levy.id}
                          className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#fafafa]"
                        >
                          <td className="px-[14px] py-[12px] text-[13px]">
                            <a
                              href={`/levies/${levy.id}`}
                              className="font-semibold text-[#0f172a] hover:text-[#0f2d5c] hover:underline"
                            >
                              {levy.name}
                            </a>
                            <div className="text-[11px] text-[#64748b] mt-0.5">
                              Due{" "}
                              {new Date(levy.dueDate).toLocaleDateString(
                                "en-NG",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </td>
                          <td className="px-[14px] py-[12px] text-[13px] font-semibold">
                            {formatNaira(levy.amountKobo)}
                          </td>
                          <td className="px-[14px] py-[12px] text-[13px] text-[#64748b]">
                            {paidCount}
                          </td>
                          <td className="px-[14px] py-[12px]">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                levy.status === "ACTIVE"
                                  ? "bg-[#dcfce7] text-[#16a34a]"
                                  : levy.status === "DRAFT"
                                    ? "bg-[#f1f5f9] text-[#64748b]"
                                    : "bg-[#e2e8f0] text-[#64748b]"
                              }`}
                            >
                              {levy.status === "ACTIVE"
                                ? "Active"
                                : levy.status === "DRAFT"
                                  ? "Draft"
                                  : "Closed"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Expense Log */}
          <section aria-label="Expense log">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-[#0f172a]">
                Expense Log
              </h2>
              <a
                href="/expenses/new"
                className="text-[13px] font-semibold text-[#0f2d5c] hover:underline"
              >
                + Add expense
              </a>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg shadow-sm">
                <EmptyState
                  message="No expenses recorded."
                  context="Post your first expense so residents can see where funds are going."
                  action={{ label: "Add expense", href: "/expenses/new" }}
                />
              </div>
            ) : (
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc]">
                      <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                        Category
                      </th>
                      <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                        Description
                      </th>
                      <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                        Amount
                      </th>
                      <th className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#fafafa]"
                      >
                        <td className="px-[14px] py-[12px]">
                          <CategoryDot category={expense.category} />
                        </td>
                        <td className="px-[14px] py-[12px] text-[13px] text-[#0f172a]">
                          {expense.description}
                          {expense.amountKobo < 0 && (
                            <span className="ml-1 text-[10px] text-[#64748b]">
                              (correction)
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-[14px] py-[12px] text-[13px] font-semibold ${expense.amountKobo < 0 ? "text-[#16a34a]" : "text-[#0f172a]"}`}
                        >
                          {expense.amountKobo < 0 ? "−" : ""}
                          {formatNaira(Math.abs(expense.amountKobo))}
                        </td>
                        <td className="px-[14px] py-[12px] text-[12px] text-[#64748b]">
                          {new Date(expense.expenseDate).toLocaleDateString(
                            "en-NG",
                            { day: "numeric", month: "short" },
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-[14px] py-2 border-t border-[#e2e8f0] flex items-center gap-1 text-[11px] text-[#94a3b8]">
                  <span>🔒</span>
                  <span>
                    Entries are permanent and cannot be edited or deleted
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Trust banner */}
        <TrustBanner publicToken={estate.publicToken} />
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
      <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] mb-1">
        {label}
      </div>
      <div
        className="text-[20px] font-bold"
        style={{ color: valueColor ?? "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}
