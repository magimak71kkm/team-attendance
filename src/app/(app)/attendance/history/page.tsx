import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const PAGE = 20;

export default async function AttendanceHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [total, rows] = await Promise.all([
    prisma.attendanceRecord.count({ where: { userId } }),
    prisma.attendanceRecord.findMany({
      where: { userId },
      orderBy: { at: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">출퇴근 이력</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          본인 기록만 표시됩니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full min-w-[20rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-raised)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-2 font-medium">구분</th>
              <th className="px-4 py-2 font-medium">시각 (서울)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--border)]">
                <td className="px-4 py-2">
                  {r.kind === "CHECK_IN" ? "출근" : "퇴근"}
                </td>
                <td className="px-4 py-2 tabular-nums text-[var(--muted)]">
                  {r.at.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-8 text-center text-[var(--muted)]"
                >
                  기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav className="flex items-center justify-between text-sm">
        <span className="text-[var(--muted)]">
          {page} / {totalPages} 페이지
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`/attendance/history?page=${page - 1}`}
              className="rounded border border-[var(--border)] px-3 py-1 hover:border-[var(--accent)]"
            >
              이전
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/attendance/history?page=${page + 1}`}
              className="rounded border border-[var(--border)] px-3 py-1 hover:border-[var(--accent)]"
            >
              다음
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
