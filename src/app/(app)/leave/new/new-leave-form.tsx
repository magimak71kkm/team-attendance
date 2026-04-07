"use client";

import { useState } from "react";
import { createLeaveRequestAction } from "../actions";

type Lt = { id: string; code: string; name: string };

export function NewLeaveForm({ types }: { types: Lt[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await createLeaveRequestAction(fd);
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
      <div>
        <label htmlFor="typeId" className="block text-sm text-[var(--muted)]">
          유형
        </label>
        <select
          id="typeId"
          name="typeId"
          required
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm text-[var(--muted)]"
          >
            시작일
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm text-[var(--muted)]">
            종료일
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
          />
        </div>
      </div>
      <div>
        <label htmlFor="halfDay" className="block text-sm text-[var(--muted)]">
          반차 구분 (연차·병가에만, 선택)
        </label>
        <select
          id="halfDay"
          name="halfDay"
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
        >
          <option value="">해당 없음</option>
          <option value="AM">오전</option>
          <option value="PM">오후</option>
        </select>
      </div>
      <div>
        <label htmlFor="reason" className="block text-sm text-[var(--muted)]">
          사유 (선택)
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={500}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
        />
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
        {pending ? "제출 중…" : "신청"}
      </button>
    </form>
  );
}
