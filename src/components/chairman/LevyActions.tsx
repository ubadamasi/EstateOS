"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  levyId: string;
  status: string;
}

export function LevyActions({ levyId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function activate() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/chairman/levies/${levyId}/activate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to activate");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function close() {
    if (
      !confirm(
        "Close this levy? Residents will no longer be able to submit payments."
      )
    )
      return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/chairman/levies/${levyId}/close`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to close");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {status === "DRAFT" && (
        <button
          onClick={activate}
          disabled={loading}
          className="bg-[#16a34a] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#15803d] transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? "Activating..." : "Activate levy"}
        </button>
      )}
      {status === "ACTIVE" && (
        <button
          onClick={close}
          disabled={loading}
          className="border border-[#e2e8f0] text-[#64748b] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? "Closing..." : "Close levy"}
        </button>
      )}
      {error && (
        <p className="text-[12px] text-[#dc2626] max-w-[200px] text-right">
          {error}
        </p>
      )}
    </div>
  );
}
