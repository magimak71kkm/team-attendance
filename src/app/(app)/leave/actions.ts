"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { leaveRequestSchema } from "@/validators/leave";

function atNoonKst(ymd: string) {
  return new Date(`${ymd}T12:00:00+09:00`);
}

export async function createLeaveRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, message: "로그인이 필요합니다." };
  }

  const raw = {
    typeId: String(formData.get("typeId") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    halfDay: formData.get("halfDay")?.toString() as "AM" | "PM" | undefined,
    reason: formData.get("reason")?.toString(),
  };

  const parsed = leaveRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.flatten().formErrors[0] ?? "입력값을 확인하세요.",
    };
  }

  const type = await prisma.leaveType.findUnique({
    where: { id: parsed.data.typeId },
  });
  if (!type) {
    return { ok: false as const, message: "유형을 찾을 수 없습니다." };
  }

  let halfDay: "AM" | "PM" | null = null;
  if (type.code === "HALF_AM") halfDay = "AM";
  else if (type.code === "HALF_PM") halfDay = "PM";
  else if (
    parsed.data.halfDay &&
    (type.code === "ANNUAL" || type.code === "SICK")
  ) {
    halfDay = parsed.data.halfDay;
  }

  if (
    (type.code === "HALF_AM" || type.code === "HALF_PM") &&
    parsed.data.startDate !== parsed.data.endDate
  ) {
    return {
      ok: false as const,
      message: "반차 유형은 시작일과 종료일이 같아야 합니다.",
    };
  }

  if (halfDay && parsed.data.startDate !== parsed.data.endDate) {
    return {
      ok: false as const,
      message: "반차는 하루 단위로만 신청할 수 있습니다.",
    };
  }

  await prisma.leaveRequest.create({
    data: {
      userId: session.user.id,
      typeId: type.id,
      startDate: atNoonKst(parsed.data.startDate),
      endDate: atNoonKst(parsed.data.endDate),
      halfDay,
      reason: parsed.data.reason || null,
    },
  });

  revalidatePath("/leave");
  revalidatePath("/dashboard");
  return { ok: true as const, message: "신청되었습니다." };
}

export async function decideLeaveAction(
  leaveId: string,
  decision: "APPROVED" | "REJECTED",
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false as const, message: "권한이 없습니다." };
  }

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: decision,
      decidedAt: new Date(),
      decidedById: session.user.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { ok: true as const, message: "반영되었습니다." };
}
