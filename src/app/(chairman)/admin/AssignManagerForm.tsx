"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AssignManagerForm({ estateId }: { estateId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/estates/${estateId}/assign-manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to assign manager");
        return;
      }

      setSuccess(true);
      setEmail("");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#e2e8f0]">
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSuccess(false);
          setError("");
        }}
        placeholder="manager@example.com"
        required
        className="flex-1 min-w-[180px] border border-[#e2e8f0] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-[#0f2d5c] text-white text-[14px] font-semibold px-4 py-2 rounded-md hover:bg-[#0a2246] transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {loading ? "Assigning..." : "Assign manager"}
      </button>
      {success && (
        <span className="text-[13px] text-[#16a34a] font-medium">Assigned.</span>
      )}
      {error && (
        <span className="text-[13px] text-[#dc2626]">{error}</span>
      )}
    </form>
  );
}
