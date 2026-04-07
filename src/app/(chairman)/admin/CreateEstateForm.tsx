"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#0f172a] mb-1.5">
        {label}
        {required && <span className="text-[#dc2626] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function CreateEstateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "Lagos",
    unitCount: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/estates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          unitCount: parseInt(form.unitCount, 10),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create estate");
        return;
      }

      router.refresh();
      setForm({ name: "", address: "", city: "", state: "Lagos", unitCount: "" });
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] bg-[#f1f5f9]";

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
      <h2 className="text-[14px] font-semibold text-[#0f172a] mb-4">
        Create New Estate
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Estate name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Greenfield Estate"
              maxLength={120}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Unit count" required>
            <input
              type="number"
              value={form.unitCount}
              onChange={(e) => setForm({ ...form, unitCount: e.target.value })}
              placeholder="e.g. 120"
              min={1}
              required
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Address" required>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="e.g. 14 Admiralty Way"
            maxLength={200}
            required
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City" required>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Lagos"
              maxLength={80}
              required
              className={inputClass}
            />
          </Field>

          <Field label="State" required>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="e.g. Lagos"
              maxLength={80}
              required
              className={inputClass}
            />
          </Field>
        </div>

        {error && (
          <p
            role="alert"
            className="text-[13px] text-[#dc2626] bg-[#fee2e2] px-3 py-2 rounded-lg"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#0f2d5c] text-white text-[14px] font-semibold px-4 py-2 rounded-md hover:bg-[#0a2246] transition-colors disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create estate"}
        </button>
      </form>
    </div>
  );
}
