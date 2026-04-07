import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { ResidentImport } from "@/components/chairman/ResidentImport";
import { ResidentList } from "@/components/chairman/ResidentList";
import { AddResidentForm } from "@/components/chairman/AddResidentForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.estateId) redirect("/login");

  const estateId = session.user.estateId;
  const db = getPrismaForEstate(estateId);

  const [estate, residents] = await Promise.all([
    db.estate.findUnique({ where: { id: estateId } }),
    db.resident.findMany({
      where: { estateId },
      orderBy: { unitId: "asc" },
      select: { id: true, unitId: true, name: true, email: true, phone: true, type: true, isActive: true, userId: true },
    }),
  ]);

  if (!estate) redirect("/login");

  return (
    <div className="max-w-[800px] mx-auto px-5 py-6 space-y-8">
      <div>
        <a href="/dashboard" className="text-[13px] text-[#64748b] hover:text-[#0f172a]">
          ← Dashboard
        </a>
      </div>
      <h1 className="text-[18px] font-bold text-[#0f172a]">Settings</h1>

      {/* Estate info */}
      <section>
        <h2 className="text-[14px] font-semibold text-[#0f172a] mb-3">
          Estate
        </h2>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-sm space-y-1 text-[13px]">
          <div>
            <span className="text-[#64748b]">Name:</span>{" "}
            <span className="font-semibold">{estate.name}</span>
          </div>
          <div>
            <span className="text-[#64748b]">Address:</span>{" "}
            {estate.address}, {estate.city}, {estate.state}
          </div>
          <div>
            <span className="text-[#64748b]">Units:</span>{" "}
            {estate.unitCount}
          </div>
          <div>
            <span className="text-[#64748b]">Status:</span>{" "}
            <span
              className={`font-semibold ${estate.status === "ACTIVE" ? "text-[#16a34a]" : "text-[#d97706]"}`}
            >
              {estate.status}
            </span>
          </div>
          <div>
            <span className="text-[#64748b]">Public summary:</span>{" "}
            <a
              href={`/public/${estate.publicToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0f2d5c] hover:underline"
            >
              View →
            </a>
          </div>
        </div>
      </section>

      {/* Import residents */}
      <section>
        <h2 className="text-[14px] font-semibold text-[#0f172a] mb-1">
          Import Residents
        </h2>
        <p className="text-[12px] text-[#64748b] mb-3">
          Upload a CSV with columns:{" "}
          <code className="bg-[#f1f5f9] px-1 rounded">name</code>,{" "}
          <code className="bg-[#f1f5f9] px-1 rounded">unit_id</code>,{" "}
          <code className="bg-[#f1f5f9] px-1 rounded">phone</code>,{" "}
          <code className="bg-[#f1f5f9] px-1 rounded">email</code> (optional),{" "}
          <code className="bg-[#f1f5f9] px-1 rounded">type</code> (LANDLORD or
          TENANT, optional).
        </p>
        <ResidentImport />
      </section>

      {/* Resident list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-[#0f172a]">
            Residents ({residents.filter((r) => r.isActive).length} active)
          </h2>
          <AddResidentForm />
        </div>
        <ResidentList residents={residents} />
      </section>
    </div>
  );
}
