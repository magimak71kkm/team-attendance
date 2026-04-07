import Link from "next/link";
import { prisma } from "@/lib/db";
import { EditUserForm } from "./edit-user-form";

export default async function AdminEditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [user, teams] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, teamId: true, role: true },
    }),
    prisma.team.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">사용자 수정</h1>
        <p className="text-sm text-[var(--muted)]">대상 사용자를 찾을 수 없습니다.</p>
        <Link
          href="/admin/users"
          className="inline-flex rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
        >
          사용자 관리
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">사용자 수정</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            이름, 이메일, 팀 정보를 수정합니다.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
        >
          사용자 관리
        </Link>
      </div>

      <EditUserForm
        userId={user.id}
        initial={{ email: user.email, name: user.name, teamId: user.teamId }}
        teams={teams}
        emailLocked={user.role === "ADMIN"}
      />
    </div>
  );
}

