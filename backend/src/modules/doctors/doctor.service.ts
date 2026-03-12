import prisma from "../../config/db.ts";

export async function getAllDoctors() {
  return prisma.doctor.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getDoctorById(id: string) {
  return prisma.doctor.findUnique({
    where: { id },
  });
}

export async function getDoctorSchedule(doctorId: string) {
  return prisma.doctorSchedule.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: "asc" },
  });
}
