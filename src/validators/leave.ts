import { z } from "zod";

export const leaveRequestSchema = z
  .object({
    typeId: z.string().min(1),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    halfDay: z.enum(["AM", "PM"]).optional(),
    reason: z.string().max(500).optional(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "종료일은 시작일 이후여야 합니다.",
    path: ["endDate"],
  });
