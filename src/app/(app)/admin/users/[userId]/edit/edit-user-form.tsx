"use client";

import { useState } from "react";
import { adminUpdateUserAction } from "../../admin-actions";

type TeamLite = { id: string; name: string };

export function EditUserForm({
  userId,
  initial,
  teams,
  emailLocked,
}: {
  userId: string;
  initial: { email: string; name: string; teamId: string | null };
  teams: TeamLite[];
  emailLocked: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("userId", userId);
    const r = await adminUpdateUserAction(fd);
    setPending(false);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setMessage(r.message);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm text-[var(--muted)]">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={initial.email}
            disabled={emailLocked}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)] disabled:opacity-60"
          />
          {emailLocked && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              관리자 계정의 이메일은 변경할 수 없습니다.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="name" className="block text-sm text-[var(--muted)]">
            이름
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initial.name}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="teamId" className="block text-sm text-[var(--muted)]">
          팀 (선택)
        </label>
        <select
          id="teamId"
          name="teamId"
          defaultValue={initial.teamId ?? ""}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
        >
          <option value="">미지정</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
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
        {pending ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}

