"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function ReceiptUploadButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setSuccess(false);

    try {
      const fd = new FormData();
      fd.append("receipt", file);

      const res = await fetch(`/api/resident/payments/${paymentId}/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (success) {
    return (
      <p className="text-[13px] text-[#16a34a] font-semibold">
        Receipt submitted — waiting for chairman confirmation.
      </p>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id={`receipt-${paymentId}`}
      />
      <label
        htmlFor={`receipt-${paymentId}`}
        className={`inline-flex items-center gap-1.5 border border-[#0f2d5c] text-[#0f2d5c] text-[13px] font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#0f2d5c] hover:text-white transition-colors ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload receipt"}
      </label>
      <p className="text-[11px] text-[#64748b] mt-1">
        JPG, PNG, WebP or PDF · max 5 MB
      </p>
      {error && (
        <p role="alert" className="text-[12px] text-[#dc2626] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
