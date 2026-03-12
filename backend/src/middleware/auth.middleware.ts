import * as jwt from "jsonwebtoken";
import { env } from "../config/env.ts";
import prisma from "../config/db.ts";
import { logger } from "../utils/logger.ts";
import type { RouteContext, AuthUser } from "../types/index.ts";

/**
 * Auth middleware — verifies JWT token and attaches user to context
 */
export async function authMiddleware(
  req: Request,
  ctx: RouteContext
): Promise<RouteContext | Response> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json(
      { success: false, error: "Missing or invalid authorization header" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return Response.json(
      { success: false, error: "Token not provided" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      phone: string;
      role: string;
    };

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    const authUser: AuthUser = {
      userId: user.id,
      phone: user.phone,
      role: user.role || "PATIENT",
    };

    return { ...ctx, user: authUser };
  } catch (error) {
    logger.error("JWT verification failed", error);
    return Response.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
