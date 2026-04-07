import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRow } from "./UserRow";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      estateManager: {
        select: {
          estate: { select: { id: true, name: true } },
        },
      },
      residents: {
        select: {
          estate: { select: { name: true } },
          unitId: true,
        },
        take: 1,
      },
    },
  });

  const roleCounts = {
    PLATFORM_ADMIN: users.filter((u) => u.role === "PLATFORM_ADMIN").length,
    ESTATE_MANAGER: users.filter((u) => u.role === "ESTATE_MANAGER").length,
    RESIDENT: users.filter((u) => u.role === "RESIDENT").length,
  };

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-6">
      <h1 className="text-[18px] font-bold text-[#0f172a] mb-1">Users</h1>
      <p className="text-[13px] text-[#64748b] mb-6">
        {users.length} total · {roleCounts.PLATFORM_ADMIN} admins · {roleCounts.ESTATE_MANAGER} managers · {roleCounts.RESIDENT} residents
      </p>

      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-[#64748b]">No users yet.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc]">
                {["User", "Role", "Estate", "Actions"].map((h) => (
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
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={{
                    ...user,
                    createdAt: user.createdAt.toISOString(),
                  }}
                  currentUserId={session.user.id}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
