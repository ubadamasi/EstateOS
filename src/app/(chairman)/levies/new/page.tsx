"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLevyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    amountNaira: "",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/chairman/levies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create levy");
        return;
      }

      router.push(`/levies/${data.levy.id}`);
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-[560px] mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <a
          href="/levies"
          className="text-[13px] text-[#64748b] hover:text-[#0f172a]"
        >
          ← Levies
        </a>
        <h1 className="text-[18px] font-bold text-[#0f172a]">
          Create Levy
        </h1>
      </div>

      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Levy name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Q2 2026 Security Levy"
              maxLength={120}
              required
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] bg-[#f1f5f9]"
            />
          </Field>

          <Field label="Description (optional)">
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="What does this levy cover?"
              maxLength={500}
              rows={2}
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] bg-[#f1f5f9] resize-none"
            />
          </Field>

          <Field label="Amount per unit (₦)" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#64748b]">
                ₦
              </span>
              <input
                type="text"
                value={form.amountNaira}
                onChange={(e) =>
                  setForm({ ...form, amountNaira: e.target.value })
                }
                placeholder="e.g. 25000"
                required
                className="w-full border border-[#e2e8f0] rounded-lg pl-7 pr-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] bg-[#f1f5f9]"
              />
            </div>
            <p className="text-[11px] text-[#64748b] mt-1">
              This amount will be assigned to every active resident.
            </p>
          </Field>

          <Field label="Due date" required>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              min={minDate}
              required
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] bg-[#f1f5f9]"
            />
          </Field>

          {error && (
            <p
              role="alert"
              className="text-[13px] text-[#dc2626] bg-[#fee2e2] px-3 py-2 rounded-lg"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/levies")}
              className="flex-1 border border-[#e2e8f0] text-[#0f172a] text-[14px] font-semibold py-2.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0f2d5c] text-white text-[14px] font-semibold py-2.5 rounded-lg hover:bg-[#0a2246] transition-colors disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create levy"}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-4 text-[12px] text-[#64748b] text-center">
        Levy is saved as a draft. Activate it from the levy detail page to
        create payment records for all residents.
      </p>
    </div>
  );
}

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
