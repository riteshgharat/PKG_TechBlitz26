import prisma from "../../config/db.ts";

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByPhone(phone: string) {
  return prisma.user.findUnique({ where: { phone } });
}

export async function updateUser(id: string, data: { name?: string }) {
  return prisma.user.update({ where: { id }, data });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, phone: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteUserAccount(id: string, phone: string) {
  // Find related records by phone first
  const patient = await prisma.patient.findUnique({ where: { phone } });
  const doctor = await prisma.doctor.findUnique({ where: { phone } });

  // Delete appointments linked to patient or doctor
  if (patient) await prisma.appointment.deleteMany({ where: { patientId: patient.id } });
  if (doctor) {
    await prisma.appointment.deleteMany({ where: { doctorId: doctor.id } });
    await prisma.doctorSchedule.deleteMany({ where: { doctorId: doctor.id } });
  }

  // Delete profile records
  if (patient) await prisma.patient.delete({ where: { id: patient.id } });
  if (doctor) await prisma.doctor.delete({ where: { id: doctor.id } });

  // Delete OTP records and user
  await prisma.otpVerification.deleteMany({ where: { phone } });
  await prisma.user.delete({ where: { id } });
}
