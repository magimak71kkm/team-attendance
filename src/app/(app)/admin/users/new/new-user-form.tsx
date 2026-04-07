"use client";

import { useState } from "react";
import { createUserAction } from "../actions";

type TeamLite = { id: string; name: string };

export function NewUserForm({ teams }: { teams: TeamLite[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await createUserAction(fd);
    setPending(false);
    if (r.ok) {
      setMessage(r.message);
      e.currentTarget.reset();
    } else {
      setError(r.message);
    }
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
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
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
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="password"
            className="block text-sm text-[var(--muted)]"
          >
            초기 비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            최소 8자 (사용자가 로그인 후 변경 기능은 아직 없음)
          </p>
        </div>
        <div>
          <label htmlFor="teamId" className="block text-sm text-[var(--muted)]">
            팀 (선택)
          </label>
          <select
            id="teamId"
            name="teamId"
            defaultValue=""
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
        {pending ? "생성 중…" : "사용자 생성"}
      </button>
    </form>
  );
}

