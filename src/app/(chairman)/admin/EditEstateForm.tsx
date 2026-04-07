"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Estate {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  unitCount: number;
  status: string;
  managers: { user: { id: string; email: string } }[];
}

export function EditEstateCard({ estate }: { estate: Estate }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: estate.name,
    address: estate.address,
    city: estate.city,
    state: estate.state,
    unitCount: estate.unitCount,
    status: estate.status as "ACTIVE" | "SUSPENDED" | "PENDING",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Manager state
  const [managerEmail, setManagerEmail] = useState(estate.managers[0]?.user.email ?? "");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [unassignLoading, setUnassignLoading] = useState(false);

  async function handleSave() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/estates/${estate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setAssignError("");
    setAssignSuccess(false);
    setAssignLoading(true);
    try {
      const res = await fetch(`/api/admin/estates/${estate.id}/assign-manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: managerEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setAssignError(data.error ?? "Failed"); return; }
      setAssignSuccess(true);
      router.refresh();
    } catch {
      setAssignError("Network error");
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleUnassign() {
    if (!confirm("Remove manager from this estate?")) return;
    setUnassignLoading(true);
    try {
      await fetch(`/api/admin/estates/${estate.id}/assign-manager`, { method: "DELETE" });
      setManagerEmail("");
      router.refresh();
    } catch {
      // ignore
    } finally {
      setUnassignLoading(false);
    }
  }

  const currentManager = estate.managers[0]?.user.email ?? null;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-semibold text-[#0f172a]">{estate.name}</p>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            {estate.city}, {estate.state} &middot; {estate.unitCount} units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              estate.status === "ACTIVE"
                ? "bg-[#dcfce7] text-[#16a34a]"
                : estate.status === "SUSPENDED"
                ? "bg-[#fee2e2] text-[#dc2626]"
                : "bg-[#fef9c3] text-[#d97706]"
            }`}
          >
            {estate.status}
          </span>
          <button
            onClick={() => { setEditing(!editing); setError(""); }}
            className="text-[12px] text-[#0f2d5c] hover:underline font-semibold"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="mt-3 pt-3 border-t border-[#e2e8f0] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">State</label>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Units</label>
              <input
                type="number"
                min={1}
                value={form.unitCount}
                onChange={(e) => setForm({ ...form, unitCount: parseInt(e.target.value) || 1 })}
                className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748b] mb-0.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "SUSPENDED" | "PENDING" })}
                className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
          {error && <p className="text-[12px] text-[#dc2626]">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#0f2d5c] text-white text-[13px] font-semibold px-4 py-1.5 rounded hover:bg-[#0a2246] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
            <button
              onClick={() => { setEditing(false); setError(""); }}
              className="text-[13px] text-[#64748b] hover:text-[#0f172a]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Manager section */}
      <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
        <p className="text-[12px] font-semibold text-[#64748b] mb-2">Manager</p>
        {currentManager ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-[#0f172a] font-medium">{currentManager}</span>
            <button
              onClick={handleUnassign}
              disabled={unassignLoading}
              className="text-[12px] text-[#dc2626] hover:underline font-semibold disabled:opacity-60"
            >
              {unassignLoading ? "Removing…" : "Unassign"}
            </button>
          </div>
        ) : (
          <p className="text-[12px] text-[#94a3b8] italic mb-2">No manager assigned</p>
        )}

        {/* Assign / reassign form */}
        <form onSubmit={handleAssign} className="flex flex-wrap items-center gap-2 mt-2">
          <input
            type="email"
            value={managerEmail}
            onChange={(e) => { setManagerEmail(e.target.value); setAssignSuccess(false); setAssignError(""); }}
            placeholder="manager@example.com"
            required
            className="flex-1 min-w-[180px] border border-[#e2e8f0] rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
          />
          <button
            type="submit"
            disabled={assignLoading}
            className="bg-[#0f2d5c] text-white text-[13px] font-semibold px-4 py-1.5 rounded-md hover:bg-[#0a2246] disabled:opacity-60 whitespace-nowrap"
          >
            {assignLoading ? "Assigning…" : currentManager ? "Reassign" : "Assign manager"}
          </button>
          {assignSuccess && <span className="text-[12px] text-[#16a34a] font-medium">Assigned.</span>}
          {assignError && <span className="text-[12px] text-[#dc2626]">{assignError}</span>}
        </form>
      </div>
    </div>
  );
}
