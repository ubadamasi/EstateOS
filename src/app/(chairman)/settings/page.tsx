import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPrismaForEstate } from "@/lib/prisma";
import { ResidentImport } from "@/components/chairman/ResidentImport";
import { ResidentList } from "@/components/chairman/ResidentList";

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
    }),
  ]);

  if (!estate) redirect("/login");

  return (
    <div className="max-w-[800px] mx-auto px-5 py-6 space-y-8">
      <h1 className="text-[18px] font-bold text-[var(--text)]">Settings</h1>

      {/* Estate info */}
      <section>
        <h2 className="text-[14px] font-semibold text-[var(--text)] mb-3">
          Estate
        </h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)] space-y-1 text-[13px]">
          <div>
            <span className="text-[var(--text-muted)]">Name:</span>{" "}
            <span className="font-semibold">{estate.name}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Address:</span>{" "}
            {estate.address}, {estate.city}, {estate.state}
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Units:</span>{" "}
            {estate.unitCount}
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Status:</span>{" "}
            <span
              className={`font-semibold ${estate.status === "ACTIVE" ? "text-[var(--green)]" : "text-[var(--amber)]"}`}
            >
              {estate.status}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Public summary:</span>{" "}
            <a
              href={`/public/${estate.publicToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--navy)] hover:underline"
            >
              View →
            </a>
          </div>
        </div>
      </section>

      {/* Import residents */}
      <section>
        <h2 className="text-[14px] font-semibold text-[var(--text)] mb-1">
          Import Residents
        </h2>
        <p className="text-[12px] text-[var(--text-muted)] mb-3">
          Upload a CSV with columns:{" "}
          <code className="bg-[var(--bg)] px-1 rounded">name</code>,{" "}
          <code className="bg-[var(--bg)] px-1 rounded">unit_id</code>,{" "}
          <code className="bg-[var(--bg)] px-1 rounded">phone</code>,{" "}
          <code className="bg-[var(--bg)] px-1 rounded">email</code> (optional),{" "}
          <code className="bg-[var(--bg)] px-1 rounded">type</code> (LANDLORD or
          TENANT, optional).
        </p>
        <ResidentImport />
      </section>

      {/* Resident list */}
      <section>
        <h2 className="text-[14px] font-semibold text-[var(--text)] mb-3">
          Residents ({residents.filter((r) => r.isActive).length} active)
        </h2>
        <ResidentList residents={residents} />
      </section>
    </div>
  );
}
