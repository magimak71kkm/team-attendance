"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { recordAttendance } from "@/lib/attendance-service";

function msg(
  r: Awaited<ReturnType<typeof recordAttendance>>,
): { ok: boolean; message: string } {
  if (r.ok) {
    return { ok: true, message: "저장되었습니다." };
  }
  switch (r.code) {
    case "DUPLICATE":
      return { ok: false, message: "이미 처리된 기록이 있습니다." };
    case "NO_CHECK_IN":
      return { ok: false, message: "먼저 출근을 기록하세요." };
    case "POLICY":
      return {
        ok: false,
        message: "승인된 종일 휴가가 있어 출퇴근을 기록할 수 없습니다.",
      };
    default:
      return { ok: false, message: "처리할 수 없습니다." };
  }
}

export async function punchInAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }
  const r = await recordAttendance(session.user.id, "CHECK_IN");
  revalidatePath("/dashboard");
  revalidatePath("/attendance/history");
  return msg(r);
}

export async function punchOutAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "로그인이 필요합니다." };
  }
  const r = await recordAttendance(session.user.id, "CHECK_OUT");
  revalidatePath("/dashboard");
  revalidatePath("/attendance/history");
  return msg(r);
}
