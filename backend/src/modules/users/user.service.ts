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
