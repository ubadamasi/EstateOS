"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (result?.error) {
      setError("Something went wrong. Please try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-[var(--navy)] rounded-[8px] flex items-center justify-center text-white font-extrabold text-[16px]">
            EO
          </div>
          <span className="text-[20px] font-bold text-[var(--navy)]">EstateOS</span>
        </div>

        {sent ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-8 text-center shadow-[var(--shadow)]">
            <div className="text-[32px] mb-3">📬</div>
            <h1 className="text-[18px] font-bold text-[var(--text)] mb-2">
              Check your email
            </h1>
            <p className="text-[14px] text-[var(--text-muted)]">
              We sent a sign-in link to <strong>{email}</strong>. It expires in
              24 hours.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-8 shadow-[var(--shadow)]">
            <h1 className="text-[20px] font-bold text-[var(--text)] mb-1">
              Sign in
            </h1>
            <p className="text-[14px] text-[var(--text-muted)] mb-6">
              Enter your email. We&apos;ll send you a sign-in link — no
              password needed.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor="email"
                className="block text-[13px] font-semibold text-[var(--text)] mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full border border-[var(--border)] rounded-[6px] px-3 py-2.5 text-[14px] text-[var(--text)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--navy)] focus:border-transparent"
              />

              {error && (
                <p className="text-[13px] text-[var(--red)] mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[var(--navy)] text-white font-semibold text-[14px] py-3 rounded-[6px] disabled:opacity-50 min-h-[44px]"
              >
                {loading ? "Sending..." : "Send sign-in link"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
