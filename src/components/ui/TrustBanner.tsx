"use client";

import { useState } from "react";

interface TrustBannerProps {
  publicToken: string;
  appUrl?: string;
}

export function TrustBanner({
  publicToken,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "",
}: TrustBannerProps) {
  const publicUrl = `${appUrl}/public/${publicToken}`;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-[#ffffff] border border-[#bbf7d0] rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[20px]" aria-hidden="true">🛡️</span>
        <span className="text-[14px] font-semibold text-[#16a34a]">
          Transparency Link
        </span>
      </div>
      <p className="text-[13px] text-[#64748b] mb-3">
        Share this in your WhatsApp group. Residents can see all collected funds
        and expenses — no login required. Entries cannot be edited or deleted.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="flex-1 min-w-0 text-[11px] bg-[#f1f5f9] border border-[#e2e8f0] rounded-[4px] px-2 py-1 truncate text-[#64748b]">
          {publicUrl}
        </code>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-3 py-1 bg-[#0f2d5c] text-white text-[12px] font-semibold rounded-[6px] min-h-[36px]"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
