import prisma from "../../config/db.ts";
import { getDayBounds } from "../../utils/time.utils.ts";

/**
 * Get today's dashboard summary
 */
export async function getTodayDashboard() {
  const today = new Date().toISOString().split("T")[0]!;
  const { start, end } = getDayBounds(today);

  // Today's appointments
  const todayAppointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: start },
      endTime: { lte: end },
    },
    orderBy: { startTime: "asc" },
  });

  // Stats
  const totalToday = todayAppointments.length;
  const scheduled = todayAppointments.filter((a) => a.status === "booked").length;
  const completed = todayAppointments.filter((a) => a.status === "completed").length;
  const cancelled = todayAppointments.filter((a) => a.status === "cancelled").length;
  const rescheduled = todayAppointments.filter((a) => a.status === "rescheduled").length;

  // Upcoming (not yet started)
  const now = new Date();
  const upcoming = todayAppointments.filter(
    (a) => a.startTime && a.startTime > now && a.status === "booked"
  );

  // Total counts
  const totalDoctors = await prisma.doctor.count();
  const totalPatients = await prisma.patient.count();

  return {
    date: today,
    stats: {
      totalToday,
      scheduled,
      completed,
      cancelled,
      rescheduled,
      totalDoctors,
      totalPatients,
    },
    upcoming,
    appointments: todayAppointments,
  };
}
