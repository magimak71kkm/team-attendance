"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function AppShell({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface-raised)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-medium text-[var(--text)]">
              대시보드
            </Link>
            <Link href="/attendance/history" className="text-[var(--muted)]">
              출퇴근 이력
            </Link>
            <Link href="/leave" className="text-[var(--muted)]">
              휴가
            </Link>
            {role === "ADMIN" && (
              <Link href="/admin" className="text-[var(--accent)]">
                관리
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--muted)]">
              {name}
              <span className="ml-1 rounded bg-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--text)]">
                {role === "ADMIN" ? "관리자" : "직원"}
              </span>
            </span>
            <Link
              href="/account/password"
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
            >
              비밀번호 변경
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
