import { z } from "zod";

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor ID"),
  patientId: z.string().uuid("Invalid patient ID"),
  startTime: z.string().datetime({ message: "startTime must be ISO 8601 format" }),
  endTime: z.string().datetime({ message: "endTime must be ISO 8601 format" }),
});

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment ID"),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment ID"),
  newStartTime: z.string().datetime({ message: "newStartTime must be ISO 8601 format" }),
  newEndTime: z.string().datetime({ message: "newEndTime must be ISO 8601 format" }),
});

export const slotsQuerySchema = z.object({
  doctorId: z.string().uuid("Invalid doctor ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});
