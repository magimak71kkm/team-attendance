import Link from "next/link";
import { PasswordForm } from "./password-form";

export default function AccountPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">비밀번호 변경</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
        >
          대시보드
        </Link>
      </div>

      <PasswordForm />
    </div>
  );
}

