"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DOUBLE_CONFIRM_THRESHOLD_KOBO, nairaToKobo, formatNaira } from "@/lib/format";

const CATEGORIES = [
  { value: "SECURITY", label: "Security" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "ADMINISTRATION", label: "Administration" },
  { value: "OTHER", label: "Other" },
] as const;

export default function NewExpensePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    category: "SECURITY",
    description: "",
    amountNaira: "",
    expenseDate: new Date().toISOString().split("T")[0],
    correctionNote: "",
    isCorrection: false,
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Double-confirm state
  const [requiresConfirm, setRequiresConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  async function uploadReceipt(): Promise<string | undefined> {
    if (!receiptFile) return undefined;
    const fd = new FormData();
    fd.append("file", receiptFile);
    // We'll upload to a generic upload endpoint and get back the file ID
    // Using the files API directly since expenses are created by the chairman
    const res = await fetch("/api/chairman/files/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error("Receipt upload failed");
    const data = await res.json();
    return data.fileId as string;
  }

  async function submit(confirmed: boolean) {
    setError("");
    setLoading(true);

    try {
      let receiptFileId: string | undefined;
      if (receiptFile) {
        try {
          receiptFileId = await uploadReceipt();
        } catch {
          setError("Failed to upload receipt — please try again");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/chairman/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          description: form.description,
          amountNaira: form.isCorrection
            ? `-${form.amountNaira.replace(/^-/, "")}`
            : form.amountNaira,
          expenseDate: form.expenseDate,
          receiptFileId,
          correctionNote: form.isCorrection ? form.correctionNote : undefined,
          confirmed,
        }),
      });

      const data = await res.json();

      if (res.status === 422 && data.requiresConfirm) {
        setRequiresConfirm(true);
        setConfirmMessage(data.message);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Failed to post expense");
        setLoading(false);
        return;
      }

      router.push("/expenses");
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(false);
  }

  // Compute preview kobo for double-confirm hint
  let previewKobo = 0;
  try {
    previewKobo = nairaToKobo(form.amountNaira);
  } catch {
    // ignore
  }
  const isLargeAmount =
    previewKobo > 0 &&
    Math.abs(previewKobo) >= DOUBLE_CONFIRM_THRESHOLD_KOBO;

  return (
    <div className="max-w-[560px] mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          ← Back
        </button>
        <h1 className="text-[18px] font-bold text-[var(--text)]">
          Post Expense
        </h1>
      </div>

      {/* Double-confirm modal overlay */}
      {requiresConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[var(--radius)] shadow-lg max-w-sm w-full p-6">
            <h2 className="text-[16px] font-bold text-[var(--text)] mb-2">
              Confirm large expense
            </h2>
            <p className="text-[14px] text-[var(--text-muted)] mb-1">
              {confirmMessage}
            </p>
            <p className="text-[13px] text-[var(--text-muted)] mb-5">
              This will be permanently recorded. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRequiresConfirm(false)}
                className="flex-1 border border-[var(--border)] text-[var(--text)] text-[14px] font-semibold py-2.5 rounded-[var(--radius)] hover:bg-[var(--bg)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRequiresConfirm(false);
                  submit(true);
                }}
                disabled={loading}
                className="flex-1 bg-[var(--red)] text-white text-[14px] font-semibold py-2.5 rounded-[var(--radius)] hover:bg-[#b91c1c] disabled:opacity-60"
              >
                {loading ? "Posting..." : "Yes, post expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Correction toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isCorrection}
              onChange={(e) =>
                setForm({ ...form, isCorrection: e.target.checked })
              }
              className="w-4 h-4 accent-[var(--navy)]"
            />
            <span className="text-[13px] text-[var(--text)]">
              This is a correction entry (negative amount)
            </span>
          </label>

          {form.isCorrection && (
            <div className="bg-[var(--amber-light)] border border-amber-200 rounded-[var(--radius)] px-3 py-2 text-[12px] text-amber-800">
              Correction entries post a negative amount to offset a previous
              expense. The original entry is never modified.
            </div>
          )}

          <Field label="Category" required>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description" required>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="e.g. Monthly security payment to Femi Security Ltd"
              maxLength={300}
              required
              className="w-full border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)]"
            />
          </Field>

          <Field label="Amount (₦)" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[var(--text-muted)]">
                {form.isCorrection ? "−₦" : "₦"}
              </span>
              <input
                type="text"
                value={form.amountNaira}
                onChange={(e) =>
                  setForm({ ...form, amountNaira: e.target.value })
                }
                placeholder="e.g. 50000"
                required
                className="w-full border border-[var(--border)] rounded-[var(--radius)] pl-8 pr-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)]"
              />
            </div>
            {isLargeAmount && (
              <p className="text-[11px] text-[var(--amber)] mt-1 font-semibold">
                Large amount ({formatNaira(previewKobo)}) — you will be asked
                to confirm.
              </p>
            )}
          </Field>

          <Field label="Expense date" required>
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) =>
                setForm({ ...form, expenseDate: e.target.value })
              }
              required
              className="w-full border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)]"
            />
          </Field>

          {form.isCorrection && (
            <Field label="Correction note" required>
              <input
                type="text"
                value={form.correctionNote}
                onChange={(e) =>
                  setForm({ ...form, correctionNote: e.target.value })
                }
                placeholder="e.g. Duplicate entry from 2026-03-15"
                maxLength={500}
                required={form.isCorrection}
                className="w-full border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--navy)] bg-[var(--bg)]"
              />
            </Field>
          )}

          <Field label="Receipt (optional)">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
              className="w-full text-[13px] text-[var(--text)]"
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              JPG, PNG, WebP or PDF — max 5 MB
            </p>
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
              {loading ? "Posting..." : "Post expense"}
            </button>
          </div>
        </form>
      </div>

      <p className="mt-4 text-[12px] text-[var(--text-muted)] text-center">
        Posted expenses are permanent and visible to all residents.
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
