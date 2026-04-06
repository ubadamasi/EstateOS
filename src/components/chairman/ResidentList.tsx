"use client";

import { useState } from "react";

interface Resident {
  id: string;
  unitId: string;
  name: string;
  email: string | null;
  phone: string;
  type: string;
  isActive: boolean;
}

export function ResidentList({ residents }: { residents: Resident[] }) {
  const [showInactive, setShowInactive] = useState(false);

  const visible = showInactive
    ? residents
    : residents.filter((r) => r.isActive);

  if (residents.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 text-center shadow-[var(--shadow)]">
        <p className="text-[13px] text-[var(--text-muted)]">
          No residents yet. Import a CSV above.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f8fafc]">
              {["Unit", "Name", "Phone", "Type", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-[14px] py-[10px] text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] border-b border-[var(--border)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={r.id}
                className={`border-b border-[var(--border)] last:border-b-0 ${!r.isActive ? "opacity-50" : "hover:bg-[#fafafa]"}`}
              >
                <td className="px-[14px] py-[11px] text-[12px] font-semibold text-[var(--text-muted)]">
                  {r.unitId}
                </td>
                <td className="px-[14px] py-[11px] text-[13px] text-[var(--text)]">
                  {r.name}
                  {r.email && (
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {r.email}
                    </div>
                  )}
                </td>
                <td className="px-[14px] py-[11px] text-[12px] text-[var(--text-muted)]">
                  {r.phone}
                </td>
                <td className="px-[14px] py-[11px] text-[12px] text-[var(--text-muted)]">
                  {r.type}
                </td>
                <td className="px-[14px] py-[11px]">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${r.isActive ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--border)] text-[var(--text-muted)]"}`}
                  >
                    {r.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {residents.some((r) => !r.isActive) && (
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="mt-2 text-[12px] text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          {showInactive ? "Hide" : "Show"} inactive residents
        </button>
      )}
    </div>
  );
}
