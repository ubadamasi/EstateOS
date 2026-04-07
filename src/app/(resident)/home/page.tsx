import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ResidentHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) redirect("/login");

  const estateId = session.user.estateId;

  if (!estateId) {
    return (
      <div className="max-w-[600px] mx-auto px-5 py-12 text-center">
        <p className="text-[15px] text-[#64748b]">
          Your account isn&apos;t linked to an estate yet. Please contact your
          estate manager.
        </p>
      </div>
    );
  }

  const db = getPrismaForEstate(estateId);

  // Find this resident's record
  const resident = await db.resident.findFirst({
    where: { estateId, userId: session.user.id },
  });

  if (!resident) {
    return (
      <div className="max-w-[600px] mx-auto px-5 py-12 text-center">
        <p className="text-[15px] text-[#64748b]">
          Your account isn&apos;t linked to a unit yet. Please contact your
          estate manager.
        </p>
      </div>
    );
  }

  const [estate, payments, recentExpenses] = await Promise.all([
    db.estate.findUnique({ where: { id: estateId } }),
    db.payment.findMany({
      where: { residentId: resident.id },
      include: { levy: { select: { name: true, dueDate: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.expense.findMany({
      where: { estateId },
      orderBy: { postedAt: "desc" },
      take: 5,
    }),
  ]);

  if (!estate) redirect("/login");

  const totalOwedKobo = payments
    .filter((p) => p.status !== "PAID")
    .reduce((s, p) => s + p.amountKobo, 0);
  const totalPaidKobo = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amountKobo, 0);
  const pendingCount = payments.filter(
    (p) => p.status === "PENDING_REVIEW"
  ).length;

  return (
    <div className="max-w-[700px] mx-auto px-5 py-6">
      {/* Welcome */}
      <div className="mb-5">
        <h1 className="text-[18px] font-bold text-[#0f172a]">
          Welcome, {resident.name.split(" ")[0]}
        </h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">
          {estate.name} · Unit {resident.unitId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] mb-1">
            Outstanding
          </div>
          <div
            className="text-[18px] font-bold"
            style={{
              color: totalOwedKobo > 0 ? "var(--red)" : "var(--green)",
            }}
          >
            {totalOwedKobo > 0 ? formatNaira(totalOwedKobo) : "Clear"}
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] mb-1">
            Total paid
          </div>
          <div className="text-[18px] font-bold text-[#16a34a]">
            {formatNaira(totalPaidKobo)}
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] mb-1">
            Pending review
          </div>
          <div
            className="text-[18px] font-bold"
            style={{
              color: pendingCount > 0 ? "var(--amber)" : "var(--text)",
            }}
          >
            {pendingCount}
          </div>
        </div>
      </div>

      {/* Recent levy payments */}
      <section className="mb-6" aria-label="My levy payments">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-[#0f172a]">
            My Levy Payments
          </h2>
          <Link
            href="/my-levies"
            className="text-[12px] text-[#0f2d5c] hover:underline"
          >
            See all →
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg shadow-sm">
            <EmptyState
              message="No levies assigned yet."
              context="Your estate manager will create levies for your unit."
            />
          </div>
        ) : (
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm divide-y divide-[#e2e8f0]">
            {payments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-[14px] py-[12px]"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#0f172a]">
                    {p.levy.name}
                  </div>
                  <div className="text-[11px] text-[#64748b] mt-0.5">
                    Due{" "}
                    {new Date(p.levy.dueDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-[#0f172a]">
                    {formatNaira(p.amountKobo)}
                  </span>
                  <StatusBadge
                    status={
                      p.status === "UNPAID" &&
                      new Date(p.levy.dueDate) < new Date()
                        ? "overdue"
                        : p.status
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent expenses */}
      <section aria-label="Estate expenses">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-[#0f172a]">
            Recent Expenses
          </h2>
          <Link
            href={`/public/${estate.publicToken}`}
            className="text-[12px] text-[#0f2d5c] hover:underline"
            target="_blank"
          >
            Full report →
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">
            No expenses posted yet.
          </p>
        ) : (
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm divide-y divide-[#e2e8f0]">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between px-[14px] py-[11px]"
              >
                <div className="text-[13px] text-[#0f172a] flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#64748b] bg-[#f1f5f9] border border-[#e2e8f0] px-1.5 py-0.5 rounded uppercase">
                    {exp.category.slice(0, 4)}
                  </span>
                  {exp.description}
                </div>
                <span
                  className={`text-[13px] font-semibold ml-3 shrink-0 ${exp.amountKobo < 0 ? "text-[#16a34a]" : "text-[#0f172a]"}`}
                >
                  {exp.amountKobo < 0 ? "−" : ""}
                  {formatNaira(Math.abs(exp.amountKobo))}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
