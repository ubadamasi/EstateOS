import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";
import { CategoryDot } from "@/components/ui/CategoryDot";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId) redirect("/login");

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const [expenses, aggregate] = await Promise.all([
    db.expense.findMany({
      where: { estateId },
      orderBy: { postedAt: "desc" },
      take: 100,
    }),
    db.expense.aggregate({
      where: { estateId },
      _sum: { amountKobo: true },
    }),
  ]);

  const totalKobo = aggregate._sum.amountKobo ?? 0;

  return (
    <div className="max-w-[900px] mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--text)]">
            Expense Log
          </h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Net total: {totalKobo >= 0 ? "" : "−"}
            {formatNaira(Math.abs(totalKobo))}
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-1.5 bg-[var(--navy)] text-white text-[13px] font-semibold px-4 py-2 rounded-[var(--radius)] hover:bg-[#0a2246] transition-colors"
        >
          + Add expense
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)]">
          <EmptyState
            message="No expenses recorded yet."
            context="Post expenses so residents can see where funds are being spent."
          />
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc]">
                {["Category", "Description", "Amount", "Date", "Receipt"].map(
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
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[#fafafa]"
                >
                  <td className="px-[14px] py-[11px]">
                    <CategoryDot category={exp.category} />
                  </td>
                  <td className="px-[14px] py-[11px] text-[13px] text-[var(--text)] max-w-[280px]">
                    {exp.description}
                    {exp.amountKobo < 0 && (
                      <span className="ml-1 text-[10px] text-[var(--text-muted)]">
                        (correction)
                      </span>
                    )}
                    {exp.correctionNote && (
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5 italic">
                        Note: {exp.correctionNote}
                      </div>
                    )}
                  </td>
                  <td
                    className={`px-[14px] py-[11px] text-[13px] font-semibold ${exp.amountKobo < 0 ? "text-[var(--green)]" : "text-[var(--text)]"}`}
                  >
                    {exp.amountKobo < 0 ? "−" : ""}
                    {formatNaira(Math.abs(exp.amountKobo))}
                  </td>
                  <td className="px-[14px] py-[11px] text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(exp.expenseDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-[14px] py-[11px]">
                    {exp.receiptFileId ? (
                      <a
                        href={`/api/files/${exp.receiptFileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-[var(--navy)] hover:underline"
                      >
                        View
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
          <div className="px-[14px] py-2 border-t border-[var(--border)] flex items-center gap-1 text-[11px] text-[var(--text-subtle)]">
            <span>🔒</span>
            <span>Entries are permanent and cannot be edited or deleted</span>
          </div>
        </div>
      )}
    </div>
  );
}
