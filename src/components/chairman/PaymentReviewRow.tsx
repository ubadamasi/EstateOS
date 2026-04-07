"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/format";

interface Payment {
  id: string;
  residentName: string;
  unitId: string;
  amountKobo: number;
  receiptFileId: string | null;
  receiptUploadedAt: string | null;
}

export function PaymentReviewRow({ payment }: { payment: Payment }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setLoading("confirm");
    setError("");
    try {
      const res = await fetch(`/api/chairman/payments/${payment.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to confirm");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function reject() {
    if (!rejectNote.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setLoading("reject");
    setError("");
    try {
      const res = await fetch(`/api/chairman/payments/${payment.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNote: rejectNote }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to reject");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="px-[14px] py-[12px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#64748b] bg-[#f1f5f9] border border-[#e2e8f0] px-1.5 py-0.5 rounded">
              {payment.unitId}
            </span>
            <span className="text-[13px] font-semibold text-[#0f172a]">
              {payment.residentName}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[13px] font-semibold text-[#0f172a]">
              {formatNaira(payment.amountKobo)}
            </span>
            {payment.receiptFileId && (
              <a
                href={`/api/files/${payment.receiptFileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-[#0f2d5c] hover:underline"
              >
                View receipt
              </a>
            )}
            {payment.receiptUploadedAt && (
              <span className="text-[11px] text-[#64748b]">
                Uploaded{" "}
                {new Date(payment.receiptUploadedAt).toLocaleDateString(
                  "en-NG",
                  { day: "numeric", month: "short" }
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!showRejectInput && (
            <>
              <button
                onClick={confirm}
                disabled={loading !== null}
                className="bg-[#16a34a] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#15803d] transition-colors disabled:opacity-60"
              >
                {loading === "confirm" ? "..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={loading !== null}
                className="border border-[#e2e8f0] text-[#64748b] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-60"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {showRejectInput && (
        <div className="mt-3 flex items-start gap-2">
          <input
            type="text"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Rejection reason (e.g. blurry image)"
            maxLength={500}
            className="flex-1 border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] bg-[#f1f5f9]"
            autoFocus
          />
          <button
            onClick={reject}
            disabled={loading !== null}
            className="bg-[#dc2626] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {loading === "reject" ? "..." : "Reject"}
          </button>
          <button
            onClick={() => {
              setShowRejectInput(false);
              setRejectNote("");
              setError("");
            }}
            className="text-[12px] text-[#64748b] hover:text-[#0f172a] px-2 py-1.5"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p className="text-[12px] text-[#dc2626] mt-1.5">{error}</p>
      )}
    </div>
  );
}
