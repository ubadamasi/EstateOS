"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Resident {
  id: string;
  unitId: string;
  name: string;
  email: string | null;
  phone: string;
  type: string;
  isActive: boolean;
  userId: string | null;
}

interface LevyOption {
  id: string;
  name: string;
  amountKobo: number;
  dueDate: string;
  assigned: boolean;
}

export function ResidentList({ residents }: { residents: Resident[] }) {
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const visible = showInactive ? residents : residents.filter((r) => r.isActive);

  if (residents.length === 0) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 text-center shadow-sm">
        <p className="text-[13px] text-[#64748b]">No residents yet. Add one above or import a CSV.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f8fafc]">
              {["Unit", "Name / Email", "Phone", "Type", "Status", ""].map((h) => (
                <th key={h} className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.04em] border-b border-[#e2e8f0]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) =>
              editingId === r.id ? (
                <EditRow
                  key={r.id}
                  resident={r}
                  onDone={() => setEditingId(null)}
                />
              ) : assigningId === r.id ? (
                <AssignLeviesRow
                  key={r.id}
                  resident={r}
                  onDone={() => setAssigningId(null)}
                />
              ) : (
                <tr
                  key={r.id}
                  className={`border-b border-[#e2e8f0] last:border-b-0 ${!r.isActive ? "opacity-50" : "hover:bg-[#fafafa]"}`}
                >
                  <td className="px-[14px] py-[11px] text-[12px] font-semibold text-[#64748b]">{r.unitId}</td>
                  <td className="px-[14px] py-[11px] text-[13px] text-[#0f172a]">
                    {r.name}
                    {r.email && <div className="text-[11px] text-[#64748b]">{r.email}</div>}
                    {!r.email && <div className="text-[11px] text-[#94a3b8] italic">No email</div>}
                  </td>
                  <td className="px-[14px] py-[11px] text-[12px] text-[#64748b]">{r.phone}</td>
                  <td className="px-[14px] py-[11px] text-[12px] text-[#64748b]">{r.type === "LANDLORD" ? "Landlord" : "Tenant"}</td>
                  <td className="px-[14px] py-[11px]">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${r.isActive ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#e2e8f0] text-[#64748b]"}`}>
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-[14px] py-[11px]">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditingId(r.id)}
                        className="text-[12px] text-[#0f2d5c] hover:underline font-semibold text-left"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setAssigningId(r.id)}
                        className="text-[12px] text-[#0f2d5c] hover:underline text-left"
                      >
                        Assign levies
                      </button>
                      <SetPasswordButton residentId={r.id} hasEmail={!!r.email} isLinked={!!r.userId} />
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {residents.some((r) => !r.isActive) && (
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="mt-2 text-[12px] text-[#64748b] hover:text-[#0f172a]"
        >
          {showInactive ? "Hide" : "Show"} inactive residents
        </button>
      )}
    </div>
  );
}

function EditRow({ resident, onDone }: { resident: Resident; onDone: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: resident.name,
    phone: resident.phone,
    email: resident.email ?? "",
    type: resident.type as "LANDLORD" | "TENANT",
    isActive: resident.isActive,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/chairman/residents/${resident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      onDone();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
      <td className="px-[14px] py-[10px] text-[12px] font-semibold text-[#64748b]">
        {resident.unitId}
      </td>
      <td className="px-[14px] py-[10px]" colSpan={4}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Email</label>
            <input
              type="email"
              value={form.email}
              placeholder="(none)"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
            />
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "LANDLORD" | "TENANT" })}
                className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
              >
                <option value="TENANT">Tenant</option>
                <option value="LANDLORD">Landlord</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Active</label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#0f2d5c]"
              />
            </div>
          </div>
        </div>
        {error && <p className="text-[12px] text-[#dc2626] mb-1">{error}</p>}
      </td>
      <td className="px-[14px] py-[10px]">
        <div className="flex flex-col gap-1">
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-[12px] font-semibold bg-[#0f2d5c] text-white px-3 py-1 rounded hover:bg-[#0a2246] disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button
            onClick={onDone}
            className="text-[12px] text-[#64748b] hover:text-[#0f172a]"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

function AssignLeviesRow({ resident, onDone }: { resident: Resident; onDone: () => void }) {
  const router = useRouter();
  const [levies, setLevies] = useState<LevyOption[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`/api/chairman/residents/${resident.id}/levies`)
      .then((r) => r.json())
      .then((data) => setLevies(data.levies ?? []))
      .catch(() => setError("Failed to load levies"))
      .finally(() => setLoading(false));
  }, [resident.id]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAssign() {
    if (selected.size === 0) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/chairman/residents/${resident.id}/levies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levyIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to assign"); return; }
      setSuccess(`${data.assigned} levy${data.assigned === 1 ? "" : "s"} assigned`);
      setSelected(new Set());
      router.refresh();
      // Re-fetch to update assigned state
      const updated = await fetch(`/api/chairman/residents/${resident.id}/levies`).then((r) => r.json());
      setLevies(updated.levies ?? []);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const unassigned = levies.filter((l) => !l.assigned);

  return (
    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
      <td className="px-[14px] py-[10px] text-[12px] font-semibold text-[#64748b] align-top">
        {resident.unitId}
      </td>
      <td className="px-[14px] py-[10px]" colSpan={4}>
        <p className="text-[12px] font-semibold text-[#0f172a] mb-2">
          Assign active levies to {resident.name}
        </p>
        {loading && <p className="text-[12px] text-[#64748b]">Loading…</p>}
        {!loading && levies.length === 0 && (
          <p className="text-[12px] text-[#64748b]">No active levies found for this estate.</p>
        )}
        {!loading && levies.length > 0 && (
          <div className="space-y-1">
            {levies.map((l) => (
              <label
                key={l.id}
                className={`flex items-center gap-2 text-[12px] ${l.assigned ? "text-[#94a3b8]" : "text-[#0f172a] cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={l.assigned || selected.has(l.id)}
                  disabled={l.assigned}
                  onChange={() => !l.assigned && toggle(l.id)}
                  className="accent-[#0f2d5c]"
                />
                <span className="font-medium">{l.name}</span>
                <span className="text-[#64748b]">
                  ₦{(l.amountKobo / 100).toLocaleString()}
                </span>
                <span className="text-[#94a3b8]">
                  due {new Date(l.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {l.assigned && (
                  <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    Already assigned
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
        {error && <p className="text-[12px] text-[#dc2626] mt-2">{error}</p>}
        {success && <p className="text-[12px] text-[#16a34a] mt-2">{success}</p>}
        {!loading && unassigned.length === 0 && levies.length > 0 && (
          <p className="text-[12px] text-[#64748b] mt-2">All active levies are already assigned.</p>
        )}
      </td>
      <td className="px-[14px] py-[10px] align-top">
        <div className="flex flex-col gap-1">
          <button
            onClick={handleAssign}
            disabled={saving || selected.size === 0}
            className="text-[12px] font-semibold bg-[#0f2d5c] text-white px-3 py-1 rounded hover:bg-[#0a2246] disabled:opacity-60"
          >
            {saving ? "Saving…" : `Assign${selected.size > 0 ? ` (${selected.size})` : ""}`}
          </button>
          <button
            onClick={onDone}
            className="text-[12px] text-[#64748b] hover:text-[#0f172a]"
          >
            Close
          </button>
        </div>
      </td>
    </tr>
  );
}

function SetPasswordButton({
  residentId,
  hasEmail,
  isLinked,
}: {
  residentId: string;
  hasEmail: boolean;
  isLinked: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!hasEmail) {
    return <span className="text-[11px] text-[#94a3b8] italic">Add email to set password</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setDone(false); setError(""); }}
        className="text-[12px] text-[#64748b] hover:underline hover:text-[#0f2d5c] text-left"
      >
        {isLinked ? "Reset password" : "Set password"}
      </button>
    );
  }

  async function handleSave() {
    if (password.length < 6) { setError("Min 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/chairman/residents/${residentId}/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setDone(true);
      setOpen(false);
      setPassword("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 mt-0.5">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Min 6 chars"
        className="border border-[#e2e8f0] rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] w-28"
      />
      {error && <span className="text-[11px] text-[#dc2626]">{error}</span>}
      {done && <span className="text-[11px] text-[#16a34a]">✓ Saved</span>}
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-[11px] bg-[#0f2d5c] text-white px-2 py-0.5 rounded disabled:opacity-60"
        >
          {loading ? "…" : "Save"}
        </button>
        <button
          onClick={() => { setOpen(false); setPassword(""); setError(""); }}
          className="text-[11px] text-[#64748b] hover:text-[#0f172a]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
