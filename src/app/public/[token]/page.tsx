import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryDot, categoryLabels } from "@/components/ui/CategoryDot";
import { formatNaira } from "@/lib/format";
import { ExpenseCategory } from "@prisma/client";

// Live data, refreshed every 60 seconds at the edge
export const revalidate = 60;

interface PublicPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicSummaryPage({ params }: PublicPageProps) {
  const { token } = await params;

  const estate = await prisma.estate.findUnique({
    where: { publicToken: token },
  });

  if (!estate || estate.status === "SUSPENDED") notFound();

  const [totalCollected, totalExpenses, recentExpenses, categoryBreakdown] =
    await Promise.all([
      prisma.payment.aggregate({
        where: { estateId: estate.id, status: "PAID" },
        _sum: { amountKobo: true },
      }),
      prisma.expense.aggregate({
        where: { estateId: estate.id },
        _sum: { amountKobo: true },
      }),
      prisma.expense.findMany({
        where: { estateId: estate.id },
        orderBy: { postedAt: "desc" },
        take: 10,
      }),
      prisma.expense.groupBy({
        by: ["category"],
        where: { estateId: estate.id },
        _sum: { amountKobo: true },
        orderBy: { _sum: { amountKobo: "desc" } },
      }),
    ]);

  const collected = totalCollected._sum.amountKobo ?? 0;
  const expenses = totalExpenses._sum.amountKobo ?? 0;
  const balance = collected - expenses;
  const maxCategory = Math.max(
    ...categoryBreakdown.map((c) => c._sum.amountKobo ?? 0),
    1
  );

  return (
    <div className="min-h-screen">
      {/* No-login badge */}
      <div className="bg-[#f0fdf4] border-b border-[#bbf7d0] text-center py-2 px-4 text-[12px] font-semibold text-[var(--green)]">
        🔓 Public page — no login required · Share this link in your WhatsApp
        group
      </div>

      {/* Hero */}
      <header
        className="text-white text-center py-9 px-5"
        style={{
          background:
            "linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)",
        }}
      >
        <div className="inline-block bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.05em] mb-3">
          Verified Estate
        </div>
        <h1 className="text-[24px] font-extrabold mb-1">{estate.name}</h1>
        <p className="text-[14px] opacity-65 mb-6">
          Community Financial Report · {new Date().getFullYear()}
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-[480px] mx-auto">
          {[
            { label: "Collected", value: formatNaira(collected), color: "#4ade80" },
            { label: "Spent", value: formatNaira(expenses), color: "#f87171" },
            { label: "Balance", value: formatNaira(balance), color: "#fff" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white/10 rounded-[10px] py-[14px] px-[10px]"
            >
              <div className="text-[11px] opacity-60 uppercase tracking-[0.04em]">
                {label}
              </div>
              <div
                className="text-[20px] font-extrabold mt-1"
                style={{ color }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[600px] mx-auto px-5 py-6 pb-12">
        {/* Trust banner */}
        <div className="bg-[var(--surface)] border border-[#bbf7d0] rounded-[var(--radius)] p-4 mb-5 shadow-[var(--shadow)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[20px]">🛡️</span>
            <span className="text-[14px] font-bold text-[var(--green)]">
              Transparent & Verifiable
            </span>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            Every naira collected and every expense recorded is logged here in
            real time.{" "}
            <strong className="text-[var(--text)]">
              This record cannot be deleted or edited.
            </strong>{" "}
            What you see is the complete financial picture.
          </p>
          <p className="text-[11px] text-[var(--text-subtle)] mt-2">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Balance detail */}
        <section className="mb-5">
          <h2 className="text-[15px] font-bold mb-3">Community Balance</h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)]">
            {[
              {
                label: "Total levies collected",
                value: `+${formatNaira(collected)}`,
                color: "var(--green)",
              },
              {
                label: "Total expenses recorded",
                value: `-${formatNaira(expenses)}`,
                color: "var(--red)",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-center justify-between py-[10px] border-b border-[var(--border)]"
              >
                <span className="text-[13px] text-[var(--text-muted)]">
                  {label}
                </span>
                <span
                  className="text-[15px] font-bold"
                  style={{ color }}
                >
                  {value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <span className="text-[13px] font-bold text-[var(--text)]">
                Available Balance
              </span>
              <span
                className="text-[17px] font-bold"
                style={{
                  color: balance >= 0 ? "var(--navy)" : "var(--red)",
                }}
              >
                {formatNaira(balance)}
              </span>
            </div>
          </div>
        </section>

        {/* Spending by category */}
        {categoryBreakdown.length > 0 && (
          <section className="mb-5">
            <h2 className="text-[15px] font-bold mb-3">Spending by Category</h2>
            <div className="flex flex-col gap-[10px]">
              {categoryBreakdown.map((cat) => {
                const amount = cat._sum.amountKobo ?? 0;
                const pct = Math.round((amount / maxCategory) * 100);
                return (
                  <div
                    key={cat.category}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-3 shadow-[var(--shadow)]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <CategoryDot category={cat.category as ExpenseCategory} />
                      <span className="text-[14px] font-bold">
                        {formatNaira(amount)}
                      </span>
                    </div>
                    <div className="bg-[#f1f5f9] rounded-[3px] h-[5px]">
                      <div
                        className="h-[5px] rounded-[3px]"
                        style={{
                          width: `${pct}%`,
                          background: "#3b82f6",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent expenses */}
        <section className="mb-5">
          <h2 className="text-[15px] font-bold mb-3">Recent Expenses</h2>
          {recentExpenses.length === 0 ? (
            <p className="text-[13px] text-[var(--text-muted)]">
              No expenses recorded yet.
            </p>
          ) : (
            <>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[400px]">
                    <thead>
                      <tr className="bg-[#f8fafc]">
                        {["Category", "Description", "Amount", "Date"].map(
                          (h) => (
                            <th
                              key={h}
                              scope="col"
                              className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] border-b border-[var(--border)]"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map((exp) => (
                        <tr
                          key={exp.id}
                          className="border-b border-[var(--border)] last:border-b-0"
                        >
                          <td className="px-[14px] py-[12px]">
                            <CategoryDot
                              category={exp.category as ExpenseCategory}
                            />
                          </td>
                          <td className="px-[14px] py-[12px] text-[13px]">
                            {exp.description}
                          </td>
                          <td className="px-[14px] py-[12px] text-[13px] font-semibold">
                            {formatNaira(exp.amountKobo)}
                          </td>
                          <td className="px-[14px] py-[12px] text-[12px] text-[var(--text-muted)]">
                            {new Date(exp.expenseDate).toLocaleDateString(
                              "en-NG",
                              { day: "numeric", month: "short" }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-subtle)] mt-2 flex items-center gap-1">
                🔒 All entries are permanent and cannot be edited or deleted.
                Corrections are logged as separate entries.
              </p>
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] text-center py-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 bg-[var(--navy)] rounded-[6px] flex items-center justify-center text-white font-extrabold text-[12px]">
            EO
          </div>
          <span className="text-[14px] font-bold text-[var(--navy)]">EstateOS</span>
        </div>
        <p className="text-[12px] text-[var(--text-muted)] mb-3">
          Transparent estate finances for every Nigerian community.
        </p>
        <a
          href="/login"
          className="inline-block bg-[var(--navy)] text-white font-semibold text-[13px] px-5 py-2 rounded-[6px]"
        >
          Manage your estate with EstateOS →
        </a>
      </footer>
    </div>
  );
}
