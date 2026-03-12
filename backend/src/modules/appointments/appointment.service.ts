import { v4 as uuidv4 } from "uuid";
import prisma from "../../config/db.ts";
import { checkConflict } from "./scheduling.engine.ts";
import { generateSlots } from "./slot.generator.ts";
import { logger } from "../../utils/logger.ts";
import type { TimeSlot } from "../../types/index.ts";

/**
 * Get available slots for a doctor on a date
 */
export async function getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
  return generateSlots(doctorId, date);
}

/**
 * Book a new appointment with clash prevention
 */
export async function bookAppointment(data: {
  doctorId: string;
  patientId: string;
  startTime: string;
  endTime: string;
}) {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  // Validate time order
  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }

  // Validate not in the past
  if (startTime < new Date()) {
    throw new Error("Cannot book appointments in the past");
  }

  // Check for conflicts
  const hasConflict = await checkConflict(data.doctorId, startTime, endTime);
  if (hasConflict) {
    throw new Error("Time slot conflicts with an existing appointment. Please choose a different time.");
  }

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      id: uuidv4(),
      doctorId: data.doctorId,
      patientId: data.patientId,
      startTime,
      endTime,
      status: "booked",
    },
  });

  logger.info(`Appointment booked: ${appointment.id}`);
  return appointment;
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status === "cancelled") {
    throw new Error("Appointment is already cancelled");
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "cancelled" },
  });

  logger.info(`Appointment cancelled: ${appointmentId}`);
  return updated;
}

/**
 * Reschedule an appointment with clash prevention
 */
export async function rescheduleAppointment(data: {
  appointmentId: string;
  newStartTime: string;
  newEndTime: string;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status === "cancelled") {
    throw new Error("Cannot reschedule a cancelled appointment");
  }

  const newStart = new Date(data.newStartTime);
  const newEnd = new Date(data.newEndTime);

  if (newStart >= newEnd) {
    throw new Error("Start time must be before end time");
  }

  if (newStart < new Date()) {
    throw new Error("Cannot reschedule to a past time");
  }

  // Check for conflicts (exclude current appointment)
  const hasConflict = await checkConflict(
    appointment.doctorId!,
    newStart,
    newEnd,
    appointment.id
  );

  if (hasConflict) {
    throw new Error("New time slot conflicts with an existing appointment. Please choose a different time.");
  }

  const updated = await prisma.appointment.update({
    where: { id: data.appointmentId },
    data: {
      startTime: newStart,
      endTime: newEnd,
      status: "rescheduled",
    },
  });

  logger.info(`Appointment rescheduled: ${data.appointmentId}`);
  return updated;
}
