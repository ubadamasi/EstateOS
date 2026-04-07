"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddResidentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    unitId: "",
    phone: "",
    email: "",
    type: "TENANT" as "LANDLORD" | "TENANT",
  });

  function reset() {
    setForm({ name: "", unitId: "", phone: "", email: "", type: "TENANT" });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/chairman/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add resident");
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-[#0f2d5c] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#0a2246] transition-colors"
      >
        + Add resident
      </button>
    );
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[#0f172a]">Add resident</h3>
        <button
          onClick={() => { setOpen(false); reset(); }}
          className="text-[#64748b] hover:text-[#0f172a] text-[18px] leading-none"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-[#0f172a] mb-1">
              Full name <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Emeka Obi"
              required
              className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#0f172a] mb-1">
              Unit ID <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="text"
              value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              placeholder="e.g. A1, Block 3"
              required
              className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-[#0f172a] mb-1">
              Phone <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 08012345678"
              required
              className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#0f172a] mb-1">
              Type <span className="text-[#dc2626]">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "LANDLORD" | "TENANT" })}
              className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] bg-white"
            >
              <option value="TENANT">Tenant</option>
              <option value="LANDLORD">Landlord</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#0f172a] mb-1">
            Email <span className="text-[#94a3b8]">(optional)</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="e.g. emeka@gmail.com"
            className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
          />
        </div>

        {error && (
          <p className="text-[13px] text-[#dc2626] bg-[#fee2e2] px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => { setOpen(false); reset(); }}
            className="flex-1 border border-[#e2e8f0] text-[#0f172a] text-[13px] font-semibold py-2 rounded-lg hover:bg-[#f1f5f9] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#0f2d5c] text-white text-[13px] font-semibold py-2 rounded-lg hover:bg-[#0a2246] transition-colors disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add resident"}
          </button>
        </div>
      </form>
    </div>
  );
}
