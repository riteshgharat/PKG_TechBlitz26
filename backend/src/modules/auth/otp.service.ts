import prisma from "../../config/db.ts";
import { logger } from "../../utils/logger.ts";

/**
 * Generate a 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via the WhatsApp channel service (fire-and-forget)
 */
async function sendOtpViaWhatsApp(phone: string, otp: string, expiryMinutes: number): Promise<void> {
  const waServiceUrl = process.env.WHATSAPP_SERVICE_URL;
  if (!waServiceUrl) return;

  const message =
    `🏥 *Clinico OTP*\n\n` +
    `Your one-time password is: *${otp}*\n\n` +
    `⏱ Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;

  try {
    const res = await fetch(`${waServiceUrl}/send-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });
    if (!res.ok) {
      const err = await res.text();
      logger.warn(`WhatsApp send failed (${res.status}): ${err}`);
    } else {
      logger.info(`OTP sent via WhatsApp to ${phone}`);
    }
  } catch (err) {
    logger.warn("WhatsApp service unreachable — OTP not delivered via WhatsApp", err);
  }
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

  logger.info(`OTP generated for ${phone}: ${otp}`);

  // Send via WhatsApp (non-blocking — failure doesn't block the response)
  sendOtpViaWhatsApp(phone, otp, expiryMinutes);

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

