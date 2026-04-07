import { prisma } from "@/lib/db";
import { orgDayBoundsUtc, todayYmdInOrg } from "@/lib/timezone";
import { auth } from "@/auth";
import { PunchButtons } from "./punch-buttons";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const ymd = todayYmdInOrg();
  const { start, end } = orgDayBoundsUtc(ymd);

  const todayRecords = await prisma.attendanceRecord.findMany({
    where: { userId, at: { gte: start, lte: end } },
    orderBy: { at: "asc" },
  });

  const ins = todayRecords.filter((r) => r.kind === "CHECK_IN");
  const outs = todayRecords.filter((r) => r.kind === "CHECK_OUT");

  const canCheckIn = ins.length === 0;
  const canCheckOut = ins.length > outs.length && outs.length === 0;

  const pendingLeaves = await prisma.leaveRequest.findMany({
    where: { userId, status: "PENDING" },
    include: { type: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const todayLeaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: "APPROVED",
      startDate: { lte: end },
      endDate: { gte: start },
    },
    include: { type: true },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold">대시보드</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          오늘 날짜(서울 기준): {ymd}
        </p>
      </div>

      {todayLeaves.length > 0 && (
        <aside className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-3 text-sm">
          <p className="font-medium text-[var(--text)]">오늘 휴가·반차</p>
          <ul className="mt-2 list-inside list-disc text-[var(--muted)]">
            {todayLeaves.map((l) => (
              <li key={l.id}>
                {l.type.name}
                {l.halfDay
                  ? l.halfDay === "AM"
                    ? " (오전)"
                    : " (오후)"
                  : ""}
              </li>
            ))}
          </ul>
          {todayLeaves.some((l) => !l.halfDay) && (
            <p className="mt-2 text-[var(--muted)]">
              종일 휴가가 있으면 출퇴근 기록이 제한됩니다.
            </p>
          )}
        </aside>
      )}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-6">
        <h2 className="text-sm font-medium text-[var(--muted)]">오늘 근태</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {todayRecords.length === 0 && (
            <li className="text-[var(--muted)]">아직 기록이 없습니다.</li>
          )}
          {todayRecords.map((r) => (
            <li key={r.id} className="flex justify-between gap-4">
              <span>{r.kind === "CHECK_IN" ? "출근" : "퇴근"}</span>
              <time className="text-[var(--muted)] tabular-nums">
                {r.at.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
              </time>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <PunchButtons canCheckIn={canCheckIn} canCheckOut={canCheckOut} />
        </div>
      </section>

      {pendingLeaves.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-[var(--muted)]">
            대기 중인 휴가 신청
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text)]">
            {pendingLeaves.map((l) => (
              <li key={l.id}>
                {l.type.name} · {l.startDate.toLocaleDateString("ko-KR")} ~{" "}
                {l.endDate.toLocaleDateString("ko-KR")}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
