import { v4 as uuidv4 } from "uuid";
import prisma from "../../config/db.ts";

/**
 * Convert HH:mm string to a Date with time-only (Prisma Time type stores as 1970-01-01T...)
 */
function timeStringToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date("1970-01-01T00:00:00Z");
  d.setUTCHours(hours!, minutes!, 0, 0);
  return d;
}

export async function getSchedulesByDoctorId(doctorId: string) {
  return prisma.doctorSchedule.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function createSchedule(data: {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration?: number;
}) {
  return prisma.doctorSchedule.create({
    data: {
      id: uuidv4(),
      doctorId: data.doctorId,
      dayOfWeek: data.dayOfWeek,
      startTime: timeStringToDate(data.startTime),
      endTime: timeStringToDate(data.endTime),
      slotDuration: data.slotDuration ?? 30,
    },
  });
}

export async function updateSchedule(
  id: string,
  data: {
    startTime?: string;
    endTime?: string;
    slotDuration?: number;
  }
) {
  const updateData: Record<string, unknown> = {};
  if (data.startTime) updateData.startTime = timeStringToDate(data.startTime);
  if (data.endTime) updateData.endTime = timeStringToDate(data.endTime);
  if (data.slotDuration !== undefined) updateData.slotDuration = data.slotDuration;

  return prisma.doctorSchedule.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteSchedule(id: string) {
  return prisma.doctorSchedule.delete({ where: { id } });
}

export async function getScheduleForDay(doctorId: string, dayOfWeek: number) {
  return prisma.doctorSchedule.findMany({
    where: { doctorId, dayOfWeek },
  });
}
