import Link from "next/link";
import { prisma } from "@/lib/db";
import { NewUserForm } from "./new-user-form";

export default async function AdminNewUserPage() {
  const teams = await prisma.team.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">사용자 추가</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            초기 비밀번호를 설정해 직원을 생성합니다.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
        >
          관리자 홈
        </Link>
      </div>

      <NewUserForm teams={teams} />
    </div>
  );
}

