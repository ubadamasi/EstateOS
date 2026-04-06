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
  if (!session?.user.id || !session.user.estateId) redirect("/login");

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  // Find this resident's record
  const resident = await db.resident.findFirst({
    where: { estateId, userId: session.user.id },
  });

  if (!resident) {
    return (
      <div className="max-w-[600px] mx-auto px-5 py-12 text-center">
        <p className="text-[15px] text-[var(--text-muted)]">
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
        <h1 className="text-[18px] font-bold text-[var(--text)]">
          Welcome, {resident.name.split(" ")[0]}
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          {estate.name} · Unit {resident.unitId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)]">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-1">
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
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)]">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-1">
            Total paid
          </div>
          <div className="text-[18px] font-bold text-[var(--green)]">
            {formatNaira(totalPaidKobo)}
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)]">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-1">
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
          <h2 className="text-[14px] font-semibold text-[var(--text)]">
            My Levy Payments
          </h2>
          <Link
            href="/my-levies"
            className="text-[12px] text-[var(--navy)] hover:underline"
          >
            See all →
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)]">
            <EmptyState
              message="No levies assigned yet."
              context="Your estate manager will create levies for your unit."
            />
          </div>
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)] divide-y divide-[var(--border)]">
            {payments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-[14px] py-[12px]"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[var(--text)]">
                    {p.levy.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Due{" "}
                    {new Date(p.levy.dueDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-[var(--text)]">
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
          <h2 className="text-[14px] font-semibold text-[var(--text)]">
            Recent Expenses
          </h2>
          <Link
            href={`/public/${estate.publicToken}`}
            className="text-[12px] text-[var(--navy)] hover:underline"
            target="_blank"
          >
            Full report →
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-[13px] text-[var(--text-muted)]">
            No expenses posted yet.
          </p>
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)] divide-y divide-[var(--border)]">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between px-[14px] py-[11px]"
              >
                <div className="text-[13px] text-[var(--text)] flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-1.5 py-0.5 rounded uppercase">
                    {exp.category.slice(0, 4)}
                  </span>
                  {exp.description}
                </div>
                <span
                  className={`text-[13px] font-semibold ml-3 shrink-0 ${exp.amountKobo < 0 ? "text-[var(--green)]" : "text-[var(--text)]"}`}
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
