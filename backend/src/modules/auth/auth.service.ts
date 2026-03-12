import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../config/db.ts";
import { env } from "../../config/env.ts";
import { createOtp, verifyOtp } from "./otp.service.ts";
import { normalizePhone } from "../../utils/phone.utils.ts";
import { logger } from "../../utils/logger.ts";

interface AuthResult {
  token: string;
  user: {
    id: string;
    phone: string;
    name: string;
    role: string | null;
  };
  isNewUser: boolean;
}

/**
 * Request OTP for a phone number
 */
export async function requestOtp(phone: string): Promise<{ message: string; otp?: string }> {
  const normalizedPhone = normalizePhone(phone);

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name: normalizedPhone, // Default name to phone, user can update later
        phone: normalizedPhone,
        role: null, // DB check constraint only allows 'doctor'/'receptionist', patients have null role
      },
    });
    logger.info(`New user created for phone: ${normalizedPhone}`);
  }

  const otp = await createOtp(normalizedPhone, env.OTP_EXPIRY_MINUTES);

  // In development, return OTP directly for testing
  if (env.NODE_ENV === "development") {
    return { message: "OTP sent successfully", otp };
  }

  return { message: "OTP sent successfully" };
}

/**
 * Verify OTP and issue JWT
 */
export async function verifyOtpAndLogin(phone: string, otp: string): Promise<AuthResult> {
  const normalizedPhone = normalizePhone(phone);

  const isValid = await verifyOtp(normalizedPhone, otp);
  if (!isValid) {
    throw new Error("Invalid or expired OTP");
  }

  const user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isNewUser = user.name === normalizedPhone; // Still using default name

  // Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      role: user.role || "PATIENT",
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
    isNewUser,
  };
}
