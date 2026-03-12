import { z } from "zod";

export const createDoctorSchema = z.object({
  userId: z.string().uuid(),
  specialization: z.string().min(1),
  qualifications: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  bio: z.string().optional(),
});

export const updateDoctorSchema = z.object({
  specialization: z.string().min(1).optional(),
  qualifications: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  bio: z.string().optional(),
});
