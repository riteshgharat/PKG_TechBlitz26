import prisma from "../../config/db.ts";
import { logger } from "../../utils/logger.ts";

/**
 * Generate a 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and store OTP for a phone number
 */
export async function createOtp(phone: string, expiryMinutes: number = 5): Promise<string> {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Invalidate any existing OTPs for this phone
  await prisma.otpVerification.updateMany({
    where: { phone, verified: false },
    data: { verified: true },
  });

  await prisma.otpVerification.create({
    data: {
      phone,
      otp,
      expiresAt,
    },
  });

  logger.info(`OTP generated for ${phone}: ${otp}`); // In production, send via SMS
  return otp;
}

/**
 * Verify OTP for a phone number
 */
export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  const record = await prisma.otpVerification.findFirst({
    where: {
      phone,
      otp,
      verified: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  });

  if (!record) {
    return false;
  }

  // Mark as verified
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return true;
}
