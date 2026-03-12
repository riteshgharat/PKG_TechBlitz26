import prisma from "../../config/db.ts";
import { logger } from "../../utils/logger.ts";

/**
 * Check if a new appointment conflicts with existing ones.
 *
 * Conflict rule:
 *   existing.start_time < new_end AND existing.end_time > new_start
 *
 * Only checks against non-cancelled appointments.
 */
export async function checkConflict(
  doctorId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<boolean> {
  const whereClause: Record<string, unknown> = {
    doctorId,
    status: { not: "cancelled" },
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  };

  // When rescheduling, exclude the current appointment from conflict check
  if (excludeAppointmentId) {
    whereClause.id = { not: excludeAppointmentId };
  }

  const conflicts = await prisma.appointment.findMany({
    where: whereClause,
    select: { id: true, startTime: true, endTime: true },
  });

  if (conflicts.length > 0) {
    logger.warn("Appointment conflict detected", {
      doctorId,
      requestedStart: startTime.toISOString(),
      requestedEnd: endTime.toISOString(),
      conflictingIds: conflicts.map((c) => c.id),
    });
    return true; // conflict exists
  }

  return false; // no conflict
}
