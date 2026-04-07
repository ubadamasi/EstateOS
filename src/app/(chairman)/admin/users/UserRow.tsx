"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "PLATFORM_ADMIN" | "ESTATE_MANAGER" | "RESIDENT";

interface UserRowProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: Role;
    createdAt: string;
    estateManager: { estate: { id: string; name: string } } | null;
    residents: { estate: { name: string }; unitId: string | null }[];
  };
  currentUserId: string;
}

export function UserRow({ user, currentUserId }: UserRowProps) {
  const router = useRouter();
  const isSelf = user.id === currentUserId;

  const [displayRole, setDisplayRole] = useState<Role>(user.role);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");

  const [pwOpen, setPwOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "ok" | "err">("idle");
  const [pwError, setPwError] = useState("");

  async function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    setRoleLoading(true);
    setRoleError("");
    const res = await fetch(`/api/admin/users/${user.id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    setRoleLoading(false);
    if (!res.ok) {
      setRoleError(data.error ?? "Failed to update role");
      setDisplayRole(user.role); // revert to server value
    } else {
      setDisplayRole(newRole);
      router.refresh();
    }
  }

  async function handleSetPassword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwLoading(true);
    setPwStatus("idle");
    setPwError("");
    const res = await fetch(`/api/admin/users/${user.id}/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setPwLoading(false);
    if (!res.ok) {
      setPwStatus("err");
      setPwError(data.error ?? "Failed");
    } else {
      setPwStatus("ok");
      setPassword("");
      setPwOpen(false);
    }
  }

  const estateLabel =
    user.estateManager?.estate.name ??
    user.residents[0]?.estate.name ??
    "—";

  const roleColors: Record<Role, string> = {
    PLATFORM_ADMIN: "bg-[#fee2e2] text-[#dc2626]",
    ESTATE_MANAGER: "bg-[#dbeafe] text-[#1d4ed8]",
    RESIDENT: "bg-[#dcfce7] text-[#16a34a]",
  };

  return (
    <tr className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#fafafa]">
      {/* Name / Email */}
      <td className="px-[14px] py-[11px]">
        <div className="text-[13px] font-semibold text-[#0f172a]">
          {user.name ?? <span className="text-[#94a3b8] font-normal">No name</span>}
        </div>
        <div className="text-[11px] text-[#64748b]">{user.email}</div>
        {user.phone && (
          <div className="text-[11px] text-[#94a3b8]">{user.phone}</div>
        )}
      </td>

      {/* Role */}
      <td className="px-[14px] py-[11px]">
        {isSelf ? (
          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${roleColors[user.role]}`}>
            {user.role.replace("_", " ")}
          </span>
        ) : (
          <div className="flex flex-col gap-1">
            <select
              value={displayRole}
              onChange={handleRoleChange}
              disabled={roleLoading}
              className="border border-[#e2e8f0] rounded px-2 py-1 text-[12px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] bg-white disabled:opacity-60"
            >
              <option value="PLATFORM_ADMIN">PLATFORM ADMIN</option>
              <option value="ESTATE_MANAGER">ESTATE MANAGER</option>
              <option value="RESIDENT">RESIDENT</option>
            </select>
            {roleError && (
              <span className="text-[11px] text-[#dc2626]">{roleError}</span>
            )}
          </div>
        )}
      </td>

      {/* Estate */}
      <td className="px-[14px] py-[11px] text-[13px] text-[#64748b]">
        {estateLabel}
      </td>

      {/* Actions */}
      <td className="px-[14px] py-[11px]">
        {isSelf ? (
          <span className="text-[11px] text-[#94a3b8]">You</span>
        ) : (
          <div className="flex flex-col gap-1">
            {!pwOpen ? (
              <button
                onClick={() => { setPwOpen(true); setPwStatus("idle"); }}
                className="text-[12px] text-[#0f2d5c] hover:underline font-semibold text-left"
              >
                Reset password
              </button>
            ) : (
              <form onSubmit={handleSetPassword} className="flex flex-col gap-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min 8)"
                  minLength={8}
                  required
                  className="border border-[#e2e8f0] rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c] w-44"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={pwLoading || password.length < 8}
                    className="bg-[#0f2d5c] text-white text-[12px] font-semibold px-3 py-1 rounded hover:bg-[#0a2246] disabled:opacity-60"
                  >
                    {pwLoading ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPwOpen(false); setPassword(""); }}
                    className="text-[12px] text-[#64748b] hover:text-[#0f172a]"
                  >
                    Cancel
                  </button>
                </div>
                {pwStatus === "ok" && (
                  <span className="text-[11px] text-[#16a34a]">Password updated</span>
                )}
                {pwStatus === "err" && (
                  <span className="text-[11px] text-[#dc2626]">{pwError}</span>
                )}
              </form>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
