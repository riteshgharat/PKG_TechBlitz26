import { z } from "zod";

export const createScheduleSchema = z.object({
  doctorId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm format"),
  slotDuration: z.number().int().min(5).max(120).default(30),
});

export const updateScheduleSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm format").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm format").optional(),
  slotDuration: z.number().int().min(5).max(120).optional(),
});
