"use client";

import { useState } from "react";
import {
  adminDeleteUserAction,
  adminResetUserPasswordAction,
} from "./admin-actions";

export function UserRowActions({ userId }: { userId: string }) {
  const [pwOpen, setPwOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await adminResetUserPasswordAction(fd);
    setPending(false);
    if (!r.ok) {
      setErr(r.message);
      return;
    }
    setMsg(r.message);
    setPwOpen(false);
    e.currentTarget.reset();
  }

  async function onDelete() {
    if (!confirm("정말 삭제할까요? 출퇴근/휴가 기록도 함께 삭제될 수 있습니다.")) {
      return;
    }
    setMsg(null);
    setErr(null);
    setPending(true);
    const fd = new FormData();
    fd.set("userId", userId);
    const r = await adminDeleteUserAction(fd);
    setPending(false);
    if (!r.ok) {
      setErr(r.message);
      return;
    }
    setMsg(r.message);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => setPwOpen((v) => !v)}
          className="rounded border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)] disabled:opacity-50"
        >
          비밀번호 변경
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onDelete}
          className="rounded border border-[var(--danger)] px-2.5 py-1 text-xs text-[var(--danger)] hover:bg-[var(--surface)] disabled:opacity-50"
        >
          삭제
        </button>
      </div>

      {pwOpen && (
        <form onSubmit={onResetPassword} className="w-full max-w-[22rem]">
          <input type="hidden" name="userId" value={userId} />
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                placeholder="새 비밀번호 (최소 8자)"
                autoComplete="new-password"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>
            <div className="col-span-2">
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="새 비밀번호 확인"
                autoComplete="new-password"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => setPwOpen(false)}
              className="rounded border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-[var(--accent)] px-3 py-1.5 text-xs text-[var(--accent-contrast)] disabled:opacity-50"
            >
              {pending ? "처리 중…" : "변경"}
            </button>
          </div>
        </form>
      )}

      {(err || msg) && (
        <p
          className={`text-xs ${err ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
          role={err ? "alert" : "status"}
        >
          {err ?? msg}
        </p>
      )}
    </div>
  );
}

