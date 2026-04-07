import { z } from "zod";

export const adminUpdateUserSchema = z.object({
  userId: z.string().min(1),
  email: z.string().trim().toLowerCase().pipe(z.string().email()),
  name: z.string().trim().min(1).max(50),
  teamId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

