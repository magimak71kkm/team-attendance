import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email()),
  name: z.string().trim().min(1).max(50),
  password: z.string().min(8).max(100),
  teamId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

