"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

export function ResidentImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/chairman/residents/import", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Import failed");
        return;
      }

      setResult(data as ImportResult);
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-[var(--shadow)]">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="hidden"
        id="resident-csv"
      />
      <label
        htmlFor="resident-csv"
        className={`inline-flex items-center gap-1.5 border border-[var(--navy)] text-[var(--navy)] text-[13px] font-semibold px-4 py-2 rounded-[var(--radius)] cursor-pointer hover:bg-[var(--navy)] hover:text-white transition-colors ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-disabled={loading}
      >
        {loading ? "Importing..." : "Choose CSV file"}
      </label>

      {error && (
        <p className="mt-3 text-[13px] text-[var(--red)] bg-[var(--red-light)] px-3 py-2 rounded">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-4 text-[13px]">
            <span className="text-[var(--green)] font-semibold">
              {result.imported} imported
            </span>
            {result.skipped > 0 && (
              <span className="text-[var(--red)] font-semibold">
                {result.skipped} skipped
              </span>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-3 max-h-[160px] overflow-y-auto">
              <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-2">
                Row errors:
              </p>
              {result.errors.map((e) => (
                <div key={e.row} className="text-[12px] text-[var(--red)]">
                  Row {e.row}: {e.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
