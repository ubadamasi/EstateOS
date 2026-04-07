"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERRORS: Record<string, string> = {
  Verification: "The sign-in link has expired or already been used. Please request a new one.",
  Default: "Something went wrong. Please try again.",
};

function ErrorMessage() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  return (
    <p className="text-[14px] text-[#64748b]">{ERRORS[error] ?? ERRORS.Default}</p>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-[#0f2d5c] rounded-lg flex items-center justify-center text-white font-extrabold text-[16px]">
            EO
          </div>
          <span className="text-[20px] font-bold text-[#0f2d5c]">EstateOS</span>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-8 text-center shadow-sm">
          <div className="text-[40px] mb-4">⚠️</div>
          <h1 className="text-[18px] font-bold text-[#0f172a] mb-2">
            Sign-in failed
          </h1>
          <Suspense fallback={<p className="text-[14px] text-[#64748b]">Loading…</p>}>
            <ErrorMessage />
          </Suspense>
          <a
            href="/login"
            className="mt-6 inline-block bg-[#0f2d5c] text-white text-[14px] font-semibold px-5 py-2.5 rounded-md"
          >
            Try again
          </a>
        </div>
      </div>
    </div>
  );
}
