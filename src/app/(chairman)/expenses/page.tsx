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
      <div className="mb-4">
        <Link href="/dashboard" className="text-[13px] text-[#64748b] hover:text-[#0f172a]">
          ← Dashboard
        </Link>
      </div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-bold text-[#0f172a]">
            Expense Log
          </h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Net total: {totalKobo >= 0 ? "" : "−"}
            {formatNaira(Math.abs(totalKobo))}
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-1.5 bg-[#0f2d5c] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#0a2246] transition-colors"
        >
          + Add expense
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg shadow-sm">
          <EmptyState
            message="No expenses recorded yet."
            context="Post expenses so residents can see where funds are being spent."
          />
        </div>
      ) : (
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc]">
                {["Category", "Description", "Amount", "Date", "Receipt"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]"
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
                  className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#fafafa]"
                >
                  <td className="px-[14px] py-[11px]">
                    <CategoryDot category={exp.category} />
                  </td>
                  <td className="px-[14px] py-[11px] text-[13px] text-[#0f172a] max-w-[280px]">
                    {exp.description}
                    {exp.amountKobo < 0 && (
                      <span className="ml-1 text-[10px] text-[#64748b]">
                        (correction)
                      </span>
                    )}
                    {exp.correctionNote && (
                      <div className="text-[11px] text-[#64748b] mt-0.5 italic">
                        Note: {exp.correctionNote}
                      </div>
                    )}
                  </td>
                  <td
                    className={`px-[14px] py-[11px] text-[13px] font-semibold ${exp.amountKobo < 0 ? "text-[#16a34a]" : "text-[#0f172a]"}`}
                  >
                    {exp.amountKobo < 0 ? "−" : ""}
                    {formatNaira(Math.abs(exp.amountKobo))}
                  </td>
                  <td className="px-[14px] py-[11px] text-[12px] text-[#64748b] whitespace-nowrap">
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
                        className="text-[12px] text-[#0f2d5c] hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-[12px] text-[#64748b]">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-[14px] py-2 border-t border-[#e2e8f0] flex items-center gap-1 text-[11px] text-[#94a3b8]">
            <span>🔒</span>
            <span>Entries are permanent and cannot be edited or deleted</span>
          </div>
        </div>
      )}
    </div>
  );
}
