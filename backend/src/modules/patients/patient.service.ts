import prisma from "../../config/db.ts";

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
  });
}

export async function getPatientByPhone(phone: string) {
  return prisma.patient.findUnique({
    where: { phone },
  });
}

export async function getAllPatients() {
  return prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
  });
}
