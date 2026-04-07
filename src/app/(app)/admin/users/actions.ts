"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createUserSchema } from "@/validators/user";

export async function createUserAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false as const, message: "권한이 없습니다." };
  }

  const raw = {
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
    password: String(formData.get("password") ?? ""),
    teamId: String(formData.get("teamId") ?? ""),
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.flatten().formErrors[0] ?? "입력값을 확인하세요.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
        role: "EMPLOYEE",
        teamId: parsed.data.teamId ?? null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return { ok: false as const, message: "이미 존재하는 이메일입니다." };
      }
    }
    return { ok: false as const, message: "생성에 실패했습니다." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users/new");
  return { ok: true as const, message: "사용자를 생성했습니다." };
}

