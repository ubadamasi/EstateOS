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
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="text-[18px] font-bold text-[var(--text)]">
          Create Levy
        </h1>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Levy name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Q2 2026 Security Levy"
              maxLength={120}
              required
              className="w-full border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)]"
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
              className="w-full border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)] resize-none"
            />
          </Field>

          <Field label="Amount per unit (₦)" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[var(--text-muted)]">
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
                className="w-full border border-[var(--border)] rounded-[var(--radius)] pl-7 pr-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)]"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
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
              className="w-full border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)]"
            />
          </Field>

          {error && (
            <p
              role="alert"
              className="text-[13px] text-[var(--red)] bg-[var(--red-light)] px-3 py-2 rounded-[var(--radius)]"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-[var(--border)] text-[var(--text)] text-[14px] font-semibold py-2.5 rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--navy)] text-white text-[14px] font-semibold py-2.5 rounded-[var(--radius)] hover:bg-[#0a2246] transition-colors disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create levy"}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-4 text-[12px] text-[var(--text-muted)] text-center">
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
      <label className="block text-[13px] font-semibold text-[var(--text)] mb-1.5">
        {label}
        {required && <span className="text-[var(--red)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
