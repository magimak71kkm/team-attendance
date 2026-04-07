import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function LeaveListPage() {
  const session = await auth();
  const rows = await prisma.leaveRequest.findMany({
    where: { userId: session!.user!.id },
    include: { type: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusKo: Record<string, string> = {
    PENDING: "대기",
    APPROVED: "승인",
    REJECTED: "반려",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">휴가 신청</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            신청 내역과 상태를 확인합니다.
          </p>
        </div>
        <Link
          href="/leave/new"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-contrast)]"
        >
          새 신청
        </Link>
      </div>

      <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium">{r.type.name}</span>
              <span
                className={
                  r.status === "APPROVED"
                    ? "text-[var(--success)]"
                    : r.status === "REJECTED"
                      ? "text-[var(--danger)]"
                      : "text-[var(--muted)]"
                }
              >
                {statusKo[r.status]}
              </span>
            </div>
            <p className="mt-1 text-[var(--muted)]">
              {r.startDate.toLocaleDateString("ko-KR")} ~{" "}
              {r.endDate.toLocaleDateString("ko-KR")}
              {r.halfDay
                ? r.halfDay === "AM"
                  ? " · 오전"
                  : " · 오후"
                : ""}
            </p>
            {r.reason && (
              <p className="mt-1 text-xs text-[var(--muted)]">{r.reason}</p>
            )}
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-4 py-10 text-center text-[var(--muted)]">
            신청 내역이 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}
