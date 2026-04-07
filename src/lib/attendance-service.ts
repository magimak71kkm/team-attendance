import type { AttendanceKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { orgDayBoundsUtc, todayYmdInOrg } from "@/lib/timezone";

export type AttendanceErrorCode =
  | "DUPLICATE"
  | "NO_CHECK_IN"
  | "POLICY"
  | "UNKNOWN";

export async function recordAttendance(
  userId: string,
  kind: AttendanceKind,
): Promise<{ ok: true } | { ok: false; code: AttendanceErrorCode }> {
  const ymd = todayYmdInOrg();
  const { start, end } = orgDayBoundsUtc(ymd);

  const blocks = await hasFullDayApprovedLeave(userId, ymd);
  if (blocks) {
    return { ok: false, code: "POLICY" };
  }

  const todayRecords = await prisma.attendanceRecord.findMany({
    where: {
      userId,
      at: { gte: start, lte: end },
    },
    orderBy: { at: "asc" },
  });

  if (kind === "CHECK_IN") {
    const hasIn = todayRecords.some((r) => r.kind === "CHECK_IN");
    if (hasIn) {
      return { ok: false, code: "DUPLICATE" };
    }
  }

  if (kind === "CHECK_OUT") {
    const ins = todayRecords.filter((r) => r.kind === "CHECK_IN").length;
    const outs = todayRecords.filter((r) => r.kind === "CHECK_OUT").length;
    if (ins <= outs) {
      return { ok: false, code: "NO_CHECK_IN" };
    }
    if (outs >= 1) {
      return { ok: false, code: "DUPLICATE" };
    }
  }

  await prisma.attendanceRecord.create({
    data: { userId, kind, source: "web" },
  });

  return { ok: true };
}

/** 승인된 종일 휴가(halfDay 없음)가 해당 날짜를 포함하면 true */
async function hasFullDayApprovedLeave(
  userId: string,
  ymd: string,
): Promise<boolean> {
  const { start, end } = orgDayBoundsUtc(ymd);

  const rows = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: "APPROVED",
      halfDay: null,
      startDate: { lte: end },
      endDate: { gte: start },
    },
    take: 1,
  });

  return rows.length > 0;
}
