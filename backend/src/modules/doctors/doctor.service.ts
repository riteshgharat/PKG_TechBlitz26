import prisma from "../../config/db.ts";

export async function getAllDoctors() {
  return prisma.doctor.findMany({ orderBy: { name: "asc" } });
}

export async function getDoctorById(id: string) {
  return prisma.doctor.findUnique({ where: { id } });
}

export async function getDoctorByPhone(phone: string) {
  return prisma.doctor.findUnique({ where: { phone } });
}

export async function getDoctorSchedule(doctorId: string) {
  return prisma.doctorSchedule.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: "asc" },
  });
}

export interface DoctorProfileData {
  name: string;
  specialization?: string;
  qualifications?: string;
  experience?: number;
  consultationFee?: number;
  bio?: string;
}

export async function createOrUpdateDoctorProfile(phone: string, data: DoctorProfileData) {
  const existing = await prisma.doctor.findUnique({ where: { phone } });
  if (existing) {
    return prisma.doctor.update({ where: { phone }, data });
  }
  return prisma.doctor.create({ data: { phone, ...data } });
}

export async function updateDoctorProfile(phone: string, data: Partial<DoctorProfileData>) {
  return prisma.doctor.update({ where: { phone }, data });
}
