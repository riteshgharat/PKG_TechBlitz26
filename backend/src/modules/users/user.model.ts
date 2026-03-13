import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["patient", "doctor", "receptionist"]).optional(),
});
