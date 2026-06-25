"use client";

import { useState, useTransition } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerifiedStudent: boolean;
  nim: string | null;
  suspendedAt: Date | null;
  suspendedReason: string | null;
  createdAt: Date;
};

export function UserManagement({ users }: { users: User[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function toggleSuspend(user: User) {
    setError("");
    const action = user.suspendedAt ? "unsuspend" : "suspend";
    if (!confirm(`${action === "suspend" ? "Suspend" : "Unsuspend"} user "${user.name}"?`)) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${user.id}/suspend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Gagal");
        }
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal");
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{user.name}</p>
              <span
                className={`rounded px-1.5 py-0.5 text-xs ${
                  user.role === "ADMIN"
                    ? "bg-brand-navy-900 text-white"
                    : user.role === "SELLER"
                      ? "bg-brand-gold-500/20 text-amber-900"
                      : "bg-neutral-100 text-neutral-900"
                }`}
              >
                {user.role}
              </span>
              {user.isVerifiedStudent && <span className="text-xs text-success">Verified</span>}
              {user.suspendedAt && (
                <span className="rounded bg-danger/20 px-1.5 py-0.5 text-xs text-danger">
                  Suspended
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              {user.email}
              {user.nim && ` • NIM: ${user.nim}`}
            </p>
          </div>

          {user.role !== "ADMIN" && (
            <button
              onClick={() => toggleSuspend(user)}
              disabled={isPending}
              className={`rounded px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                user.suspendedAt
                  ? "bg-success text-white hover:opacity-90"
                  : "bg-danger text-white hover:opacity-90"
              }`}
            >
              {user.suspendedAt ? "Unsuspend" : "Suspend"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
