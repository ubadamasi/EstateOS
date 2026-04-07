"use client";

import { useRef, useState, useEffect } from "react";
import { signOut } from "next-auth/react";

interface Props {
  userInitials: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
}

type View = "menu" | "edit-profile" | "change-password";

export function ProfileMenu({ userInitials, userName, userEmail, userPhone }: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setView("menu");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function close() {
    setOpen(false);
    setView("menu");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          setView("menu");
        }}
        className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white font-bold text-[13px] hover:ring-2 hover:ring-white/50 transition-all"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        {userInitials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 bg-white rounded-lg shadow-xl border border-[#e2e8f0] z-50 overflow-hidden">
          {view === "menu" && (
            <MenuView
              userName={userName}
              userEmail={userEmail}
              onEditProfile={() => setView("edit-profile")}
              onChangePassword={() => setView("change-password")}
              onClose={close}
            />
          )}
          {view === "edit-profile" && (
            <EditProfileView
              userName={userName}
              userPhone={userPhone}
              onBack={() => setView("menu")}
              onDone={close}
            />
          )}
          {view === "change-password" && (
            <ChangePasswordView
              onBack={() => setView("menu")}
              onDone={close}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Menu view ────────────────────────────────────────────

function MenuView({
  userName,
  userEmail,
  onEditProfile,
  onChangePassword,
  onClose,
}: {
  userName: string;
  userEmail: string;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* User info header */}
      <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="text-[13px] font-semibold text-[#0f172a] truncate">
          {userName || "No name set"}
        </div>
        <div className="text-[11px] text-[#64748b] truncate">{userEmail}</div>
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          onClick={onEditProfile}
          className="w-full text-left px-4 py-2.5 text-[13px] text-[#0f172a] hover:bg-[#f1f5f9] flex items-center gap-2.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748b]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Edit profile
        </button>
        <button
          onClick={onChangePassword}
          className="w-full text-left px-4 py-2.5 text-[13px] text-[#0f172a] hover:bg-[#f1f5f9] flex items-center gap-2.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748b]">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Change password
        </button>
      </div>

      <div className="border-t border-[#e2e8f0] py-1">
        <button
          onClick={() => {
            onClose();
            signOut({ callbackUrl: "/login" });
          }}
          className="w-full text-left px-4 py-2.5 text-[13px] text-[#dc2626] hover:bg-[#fee2e2] flex items-center gap-2.5 font-semibold"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </>
  );
}

// ─── Edit profile view ────────────────────────────────────

function EditProfileView({
  userName,
  userPhone,
  onBack,
  onDone,
}: {
  userName: string;
  userPhone?: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(userPhone ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update");
        return;
      }
      setSuccess(true);
      setTimeout(() => onDone(), 800);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <button onClick={onBack} className="text-[#64748b] hover:text-[#0f172a]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-[13px] font-semibold text-[#0f172a]">Edit profile</span>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            maxLength={20}
            className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
          />
        </div>

        {error && (
          <p className="text-[12px] text-[#dc2626]">{error}</p>
        )}
        {success && (
          <p className="text-[12px] text-[#16a34a] font-semibold">Saved!</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          className="w-full bg-[#0f2d5c] text-white text-[13px] font-semibold py-2 rounded-lg hover:bg-[#0a2246] disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Change password view ─────────────────────────────────

function ChangePasswordView({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to change password");
        return;
      }
      setSuccess(true);
      setTimeout(() => onDone(), 1000);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <button onClick={onBack} className="text-[#64748b] hover:text-[#0f172a]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-[13px] font-semibold text-[#0f172a]">Change password</span>
      </div>

      <div className="px-4 py-3 space-y-3">
        {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
          <div key={field}>
            <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
              {field === "currentPassword"
                ? "Current password"
                : field === "newPassword"
                  ? "New password"
                  : "Confirm new password"}
            </label>
            <input
              type="password"
              value={form[field as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]"
            />
          </div>
        ))}

        {error && (
          <p className="text-[12px] text-[#dc2626]">{error}</p>
        )}
        {success && (
          <p className="text-[12px] text-[#16a34a] font-semibold">Password changed!</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading || !form.currentPassword || !form.newPassword}
          className="w-full bg-[#0f2d5c] text-white text-[13px] font-semibold py-2 rounded-lg hover:bg-[#0a2246] disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </div>
    </div>
  );
}
