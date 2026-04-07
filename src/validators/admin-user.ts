import { z } from "zod";

export const adminResetPasswordSchema = z
  .object({
    userId: z.string().min(1),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "새 비밀번호가 일치하지 않습니다.",
  });

