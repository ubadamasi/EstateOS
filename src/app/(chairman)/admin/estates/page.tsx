import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateEstateForm } from "../CreateEstateForm";
import { SetPasswordForm } from "../SetPasswordForm";
import { EditEstateCard } from "../EditEstateForm";

export default async function AdminEstatesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") redirect("/");

  const estates = await prisma.estate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      managers: {
        include: { user: { select: { id: true, email: true } } },
      },
    },
  });

  return (
    <div className="max-w-[900px] mx-auto px-5 py-6 space-y-8">
      <h1 className="text-[18px] font-bold text-[#0f172a]">Estates</h1>

      <CreateEstateForm />

      <section>
        <h2 className="text-[14px] font-semibold text-[#0f172a] mb-3">
          All Estates ({estates.length})
        </h2>

        {estates.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm text-center text-[13px] text-[#64748b]">
            No estates yet. Create one above.
          </div>
        ) : (
          <div className="space-y-3">
            {estates.map((estate) => (
              <div key={estate.id} className="space-y-2">
                <EditEstateCard estate={estate} />
                {estate.managers[0] && (
                  <div className="px-1">
                    <SetPasswordForm
                      userId={estate.managers[0].user.id ?? ""}
                      userEmail={estate.managers[0].user.email ?? ""}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
