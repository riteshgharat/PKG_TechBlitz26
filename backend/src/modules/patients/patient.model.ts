import { z } from "zod";

export const createPatientSchema = z.object({
  userId: z.string().uuid(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
});

export const updatePatientSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
});
