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
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-4 shadow-sm">
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
        className={`inline-flex items-center gap-1.5 border border-[#0f2d5c] text-[#0f2d5c] text-[13px] font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#0f2d5c] hover:text-white transition-colors ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-disabled={loading}
      >
        {loading ? "Importing..." : "Choose CSV file"}
      </label>

      {error && (
        <p className="mt-3 text-[13px] text-[#dc2626] bg-[#fee2e2] px-3 py-2 rounded">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-4 text-[13px]">
            <span className="text-[#16a34a] font-semibold">
              {result.imported} imported
            </span>
            {result.skipped > 0 && (
              <span className="text-[#dc2626] font-semibold">
                {result.skipped} skipped
              </span>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg p-3 max-h-[160px] overflow-y-auto">
              <p className="text-[11px] font-semibold text-[#64748b] mb-2">
                Row errors:
              </p>
              {result.errors.map((e) => (
                <div key={e.row} className="text-[12px] text-[#dc2626]">
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
