import Link from "next/link";
import { prisma } from "@/lib/db";
import { UserRowActions } from "./user-row-actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      team: { select: { name: true } },
    },
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">사용자 관리</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            사용자 비밀번호 변경 및 삭제를 수행합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/users/new"
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
          >
            사용자 추가
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
          >
            관리자 홈
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-raised)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-2 font-medium">이름</th>
              <th className="px-4 py-2 font-medium">이메일</th>
              <th className="px-4 py-2 font-medium">팀</th>
              <th className="px-4 py-2 font-medium">역할</th>
              <th className="px-4 py-2 font-medium">생성일</th>
              <th className="px-4 py-2 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--border)]">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2 text-[var(--muted)]">{u.email}</td>
                <td className="px-4 py-2 text-[var(--muted)]">
                  {u.team?.name ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <span className="rounded bg-[var(--border)] px-2 py-0.5 text-xs">
                    {u.role === "ADMIN" ? "관리자" : "직원"}
                  </span>
                </td>
                <td className="px-4 py-2 text-[var(--muted)] tabular-nums">
                  {u.createdAt.toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-2 text-right align-top">
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className="rounded border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
                    >
                      정보 수정
                    </Link>
                  <UserRowActions userId={u.id} />
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[var(--muted)]"
                >
                  사용자가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

