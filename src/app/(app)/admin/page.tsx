import Link from "next/link";
import { prisma } from "@/lib/db";
import { DecideLeaveButtons } from "./decide-buttons";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  const sp = await searchParams;
  const teamId = sp.teamId;

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  const userWhere =
    teamId && teamId !== "all" ? { teamId } : {};

  const [pendingLeaves, recentAttendance] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { type: true, user: { include: { team: true } } },
      orderBy: { createdAt: "asc" },
      take: 30,
    }),
    prisma.attendanceRecord.findMany({
      where: { user: userWhere },
      include: { user: { include: { team: true } } },
      orderBy: { at: "desc" },
      take: 40,
    }),
  ]);

  const from = new Date();
  from.setDate(from.getDate() - 30);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold">관리</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          휴가 승인과 최근 출퇴근을 확인합니다.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-[var(--muted)]">
            데이터보내기 (CSV)
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/users/new"
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
            >
              사용자 추가
            </Link>
            <Link
              href={`/admin/export?from=${fromStr}&to=${toStr}&teamId=${teamId ?? "all"}`}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
            >
              최근 30일 CSV
            </Link>
          </div>
        </div>
        <form className="flex flex-wrap items-end gap-3 text-sm">
          <label className="flex flex-col gap-1 text-[var(--muted)]">
            팀 필터
            <select
              name="teamId"
              defaultValue={teamId ?? "all"}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--text)]"
            >
              <option value="all">전체</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-[var(--accent-contrast)]"
          >
            적용
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-medium text-[var(--muted)]">
          대기 중 휴가
        </h2>
        <ul className="mt-2 space-y-3">
          {pendingLeaves.map((l) => (
            <li
              key={l.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm"
            >
              <p className="font-medium">
                {l.user.name} ({l.user.email})
                {l.user.team && (
                  <span className="ml-2 text-[var(--muted)]">
                    · {l.user.team.name}
                  </span>
                )}
              </p>
              <p className="mt-1 text-[var(--muted)]">
                {l.type.name} · {l.startDate.toLocaleDateString("ko-KR")} ~{" "}
                {l.endDate.toLocaleDateString("ko-KR")}
              </p>
              {l.reason && (
                <p className="mt-1 text-xs text-[var(--muted)]">{l.reason}</p>
              )}
              <DecideLeaveButtons leaveId={l.id} />
            </li>
          ))}
          {pendingLeaves.length === 0 && (
            <p className="text-sm text-[var(--muted)]">대기 건이 없습니다.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium text-[var(--muted)]">
          최근 출퇴근
        </h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-raised)] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">직원</th>
                <th className="px-3 py-2">팀</th>
                <th className="px-3 py-2">구분</th>
                <th className="px-3 py-2">시각</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]">
                  <td className="px-3 py-2">{r.user.name}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">
                    {r.user.team?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.kind === "CHECK_IN" ? "출근" : "퇴근"}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-[var(--muted)]">
                    {r.at.toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
