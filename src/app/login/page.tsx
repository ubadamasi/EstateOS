"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    params.get("error") ? "Invalid email or password." : ""
  );

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-8 shadow-sm">
      <h1 className="text-[20px] font-bold text-[#0f172a] mb-1">Sign in</h1>
      <p className="text-[14px] text-[#64748b] mb-6">
        Enter your email and password to continue.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[13px] font-semibold text-[#0f172a] mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full border border-[#e2e8f0] rounded-md px-3 py-2.5 text-[14px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-[13px] font-semibold text-[#0f172a] mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full border border-[#e2e8f0] rounded-md px-3 py-2.5 text-[14px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] focus:border-transparent"
          />
        </div>

        {error && (
          <p className="text-[13px] text-[#dc2626] bg-[#fee2e2] px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-[#0f2d5c] text-white font-semibold text-[14px] py-3 rounded-md disabled:opacity-50 min-h-[44px] hover:bg-[#0a2246] transition-colors"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-[#0f2d5c] rounded-lg flex items-center justify-center text-white font-extrabold text-[16px]">
            EO
          </div>
          <span className="text-[20px] font-bold text-[#0f2d5c]">EstateOS</span>
        </div>
        <Suspense fallback={<div className="bg-white border border-[#e2e8f0] rounded-lg p-8 shadow-sm h-[280px]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
