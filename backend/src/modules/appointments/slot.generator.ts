import prisma from "../../config/db.ts";
import { getScheduleForDay } from "../schedule/schedule.service.ts";
import { getDayOfWeek, getDayBounds, addMinutes } from "../../utils/time.utils.ts";
import type { TimeSlot } from "../../types/index.ts";

/**
 * Extract hours and minutes from a Prisma Time field (stored as Date with 1970-01-01 base).
 */
function getTimeFromDate(d: Date | null): { hours: number; minutes: number } | null {
  if (!d) return null;
  return { hours: d.getUTCHours(), minutes: d.getUTCMinutes() };
}

/**
 * Generate available time slots for a doctor on a given date.
 *
 * 1. Look up doctor's schedule for the day-of-week
 * 2. Generate slots based on start/end time and slot duration
 * 3. Mark slots as unavailable if an appointment already exists
 */
export async function generateSlots(doctorId: string, dateStr: string): Promise<TimeSlot[]> {
  const dayOfWeek = getDayOfWeek(dateStr);
  const schedules = await getScheduleForDay(doctorId, dayOfWeek);

  if (schedules.length === 0) {
    return []; // Doctor doesn't work on this day
  }

  // Get existing appointments for the day
  const { start: dayStart, end: dayEnd } = getDayBounds(dateStr);
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: { not: "cancelled" },
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    select: { startTime: true, endTime: true },
  });

  const slots: TimeSlot[] = [];

  for (const schedule of schedules) {
    const startTimeParsed = getTimeFromDate(schedule.startTime);
    const endTimeParsed = getTimeFromDate(schedule.endTime);
    const slotDuration = schedule.slotDuration ?? 30;

    if (!startTimeParsed || !endTimeParsed) continue;

    // Build actual date-time from the schedule's time-of-day
    const scheduleStart = new Date(dateStr);
    scheduleStart.setHours(startTimeParsed.hours, startTimeParsed.minutes, 0, 0);

    const scheduleEnd = new Date(dateStr);
    scheduleEnd.setHours(endTimeParsed.hours, endTimeParsed.minutes, 0, 0);

    let slotStart = scheduleStart;

    while (slotStart < scheduleEnd) {
      const slotEnd = addMinutes(slotStart, slotDuration);

      if (slotEnd > scheduleEnd) break;

      // Check if slot overlaps with any existing appointment
      const isBooked = existingAppointments.some(
        (appt) =>
          appt.startTime && appt.endTime &&
          appt.startTime < slotEnd && appt.endTime > slotStart
      );

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: !isBooked,
      });

      slotStart = slotEnd;
    }
  }

  return slots;
}
