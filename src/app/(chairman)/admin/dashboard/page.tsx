import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") redirect("/");

  const [
    estateCount,
    activeEstateCount,
    userCount,
    managerCount,
    residentCount,
    totalCollected,
    totalExpenses,
    recentEstates,
  ] = await Promise.all([
    prisma.estate.count(),
    prisma.estate.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ESTATE_MANAGER" } }),
    prisma.user.count({ where: { role: "RESIDENT" } }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amountKobo: true },
    }),
    prisma.expense.aggregate({
      _sum: { amountKobo: true },
    }),
    prisma.estate.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        managers: {
          include: { user: { select: { email: true, name: true } } },
          take: 1,
        },
        _count: {
          select: { residents: { where: { isActive: true } } },
        },
      },
    }),
  ]);

  const collected = totalCollected._sum.amountKobo ?? 0;
  const expenses = totalExpenses._sum.amountKobo ?? 0;
  const netBalance = collected - expenses;

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-6">
      <h1 className="text-[18px] font-bold text-[#0f172a] mb-6">
        Platform Overview
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total Estates"
          value={String(estateCount)}
          sub={`${activeEstateCount} active`}
        />
        <StatCard
          label="Total Users"
          value={String(userCount)}
          sub={`${managerCount} managers · ${residentCount} residents`}
        />
        <StatCard
          label="Total Collected"
          value={formatNaira(collected)}
          valueColor="#16a34a"
        />
        <StatCard
          label="Total Expenses"
          value={formatNaira(Math.abs(expenses))}
          valueColor="#dc2626"
        />
      </div>

      {/* Net balance */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm mb-8 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em]">
            Platform Net Balance (all estates)
          </div>
          <div
            className="text-[24px] font-bold mt-1"
            style={{ color: netBalance >= 0 ? "#16a34a" : "#dc2626" }}
          >
            {netBalance < 0 ? "−" : ""}
            {formatNaira(Math.abs(netBalance))}
          </div>
        </div>
        <div className="text-right text-[12px] text-[#64748b] space-y-0.5">
          <div>Collected: {formatNaira(collected)}</div>
          <div>Expenses: {formatNaira(Math.abs(expenses))}</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[
          { href: "/admin/estates", label: "Manage Estates", icon: "🏘️" },
          { href: "/admin/users", label: "Manage Users", icon: "👥" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm hover:shadow-md hover:border-[#0f2d5c] transition-all flex items-center gap-3"
          >
            <span className="text-[24px]">{link.icon}</span>
            <span className="text-[14px] font-semibold text-[#0f172a]">
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent estates */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-[#0f172a]">
            Recent Estates
          </h2>
          <Link
            href="/admin/estates"
            className="text-[12px] text-[#0f2d5c] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
          {recentEstates.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-[#64748b]">
              No estates yet.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {["Estate", "Manager", "Residents", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEstates.map((estate) => (
                  <tr
                    key={estate.id}
                    className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#fafafa]"
                  >
                    <td className="px-[14px] py-[11px]">
                      <Link
                        href="/admin/estates"
                        className="text-[13px] font-semibold text-[#0f172a] hover:text-[#0f2d5c] hover:underline"
                      >
                        {estate.name}
                      </Link>
                      <div className="text-[11px] text-[#64748b]">
                        {estate.city}, {estate.state}
                      </div>
                    </td>
                    <td className="px-[14px] py-[11px] text-[13px] text-[#64748b]">
                      {estate.managers[0]
                        ? estate.managers[0].user.name ??
                          estate.managers[0].user.email
                        : "—"}
                    </td>
                    <td className="px-[14px] py-[11px] text-[13px] text-[#64748b]">
                      {estate._count.residents}
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          estate.status === "ACTIVE"
                            ? "bg-[#dcfce7] text-[#16a34a]"
                            : estate.status === "SUSPENDED"
                              ? "bg-[#fee2e2] text-[#dc2626]"
                              : "bg-[#fef3c7] text-[#d97706]"
                        }`}
                      >
                        {estate.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
      <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] mb-1">
        {label}
      </div>
      <div
        className="text-[22px] font-bold"
        style={{ color: valueColor ?? "#0f172a" }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-[#94a3b8] mt-0.5">{sub}</div>
      )}
    </div>
  );
}
