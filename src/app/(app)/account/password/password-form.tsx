"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { changePasswordAction } from "./actions";

export function PasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await changePasswordAction(fd);
    setPending(false);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setMessage(r.message);
    e.currentTarget.reset();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-6"
    >
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm text-[var(--muted)]"
        >
          현재 비밀번호
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm text-[var(--muted)]"
          >
            새 비밀번호
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm text-[var(--muted)]"
          >
            새 비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-[var(--success)]" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--accent-contrast)] disabled:opacity-50"
      >
        {pending ? "변경 중…" : "비밀번호 변경"}
      </button>
    </form>
  );
}

