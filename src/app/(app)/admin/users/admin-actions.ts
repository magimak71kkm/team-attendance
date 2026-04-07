"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { adminResetPasswordSchema } from "@/validators/admin-user";
import { adminUpdateUserSchema } from "@/validators/admin-user-edit";

function forbidden() {
  return { ok: false as const, message: "권한이 없습니다." };
}

export async function adminResetUserPasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return forbidden();
  }

  const raw = {
    userId: String(formData.get("userId") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = adminResetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    if (fieldErrors.newPassword?.[0]) {
      return { ok: false as const, message: fieldErrors.newPassword[0] };
    }
    if (fieldErrors.confirmPassword?.[0]) {
      return { ok: false as const, message: fieldErrors.confirmPassword[0] };
    }
    return {
      ok: false as const,
      message: parsed.error.flatten().formErrors[0] ?? "입력값을 확인하세요.",
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true },
  });
  if (!target) {
    return { ok: false as const, message: "대상 사용자를 찾을 수 없습니다." };
  }

  if (target.role === "ADMIN") {
    return {
      ok: false as const,
      message: "관리자 계정의 비밀번호는 이 화면에서 변경할 수 없습니다.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: target.id },
    data: { passwordHash },
  });

  revalidatePath("/admin/users");
  return { ok: true as const, message: "비밀번호를 변경했습니다." };
}

export async function adminDeleteUserAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return forbidden();
  }

  const userId = String(formData.get("userId") ?? "");
  if (!userId) {
    return { ok: false as const, message: "대상 사용자를 찾을 수 없습니다." };
  }

  if (userId === session.user.id) {
    return { ok: false as const, message: "본인 계정은 삭제할 수 없습니다." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) {
    return { ok: false as const, message: "이미 삭제되었거나 존재하지 않습니다." };
  }

  if (target.role === "ADMIN") {
    return { ok: false as const, message: "관리자 계정은 삭제할 수 없습니다." };
  }

  try {
    await prisma.$transaction([
      // If the target user is referenced as a leave decider, null it out first.
      prisma.leaveRequest.updateMany({
        where: { decidedById: target.id },
        data: { decidedById: null },
      }),
      prisma.user.delete({ where: { id: target.id } }),
    ]);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false as const, message: "삭제할 수 없습니다. 연결된 데이터가 있습니다." };
    }
    return { ok: false as const, message: "삭제에 실패했습니다." };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true as const, message: "사용자를 삭제했습니다." };
}

export async function adminUpdateUserAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return forbidden();
  }

  const raw = {
    userId: String(formData.get("userId") ?? ""),
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
    teamId: String(formData.get("teamId") ?? ""),
  };

  const parsed = adminUpdateUserSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    if (fieldErrors.email?.[0]) return { ok: false as const, message: fieldErrors.email[0] };
    if (fieldErrors.name?.[0]) return { ok: false as const, message: fieldErrors.name[0] };
    return {
      ok: false as const,
      message: parsed.error.flatten().formErrors[0] ?? "입력값을 확인하세요.",
    };
  }

  const current = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true, email: true, name: true, teamId: true },
  });
  if (!current) {
    return { ok: false as const, message: "대상 사용자를 찾을 수 없습니다." };
  }

  const nextEmail = parsed.data.email;
  const nextName = parsed.data.name;
  const nextTeamId = parsed.data.teamId ?? null;

  // For safety: do not allow editing admin email via this UI.
  if (current.role === "ADMIN" && nextEmail !== current.email) {
    return { ok: false as const, message: "관리자 계정의 이메일은 변경할 수 없습니다." };
  }

  if (
    nextEmail === current.email &&
    nextName === current.name &&
    nextTeamId === (current.teamId ?? null)
  ) {
    return { ok: true as const, message: "변경 사항이 없습니다." };
  }

  try {
    await prisma.user.update({
      where: { id: current.id },
      data: {
        email: nextEmail,
        name: nextName,
        teamId: nextTeamId,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return { ok: false as const, message: "이미 사용 중인 이메일입니다." };
      }
    }
    return { ok: false as const, message: "수정에 실패했습니다." };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${current.id}/edit`);
  return { ok: true as const, message: "사용자 정보를 수정했습니다." };
}

