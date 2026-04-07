"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetPasswordForm({ userId, userEmail }: { userId: string; userEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setError("");

    const res = await fetch(`/api/admin/users/${userId}/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setStatus("err");
      setError(data.error ?? "Failed");
    } else {
      setStatus("ok");
      setPassword("");
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] text-[#64748b] hover:text-[#0f2d5c] font-semibold underline"
      >
        Set password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2 flex-wrap">
      <span className="text-[12px] text-[#64748b]">{userEmail}</span>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (min 8 chars)"
        minLength={8}
        required
        className="border border-[#e2e8f0] rounded px-2 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] w-52"
      />
      <button
        type="submit"
        disabled={loading || password.length < 8}
        className="bg-[#0f2d5c] text-white text-[12px] font-semibold px-3 py-1 rounded hover:bg-[#0a2246] disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-[#64748b] hover:text-[#0f172a]">
        Cancel
      </button>
      {status === "err" && <span className="text-[12px] text-[#dc2626]">{error}</span>}
    </form>
  );
}
