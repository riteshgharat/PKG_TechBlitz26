import { z } from "zod";
import { requestOtp, verifyOtpAndLogin } from "./auth.service.ts";
import { logger } from "../../utils/logger.ts";
import type { RouteContext } from "../../types/index.ts";

const requestOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

/**
 * POST /auth/request-otp
 */
export async function handleRequestOtp(req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const parsed = requestOtpSchema.safeParse(ctx.body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await requestOtp(parsed.data.phone);
    return Response.json({ success: true, data: result });
  } catch (error) {
    logger.error("Error requesting OTP", error);
    return Response.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

/**
 * POST /auth/verify-otp
 */
export async function handleVerifyOtp(req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const parsed = verifyOtpSchema.safeParse(ctx.body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await verifyOtpAndLogin(parsed.data.phone, parsed.data.otp);
    return Response.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    logger.error("Error verifying OTP", error);
    return Response.json(
      { success: false, error: message },
      { status: 401 }
    );
  }
}
