import { updateUserSchema } from "./user.model.ts";
import * as userService from "./user.service.ts";
import { authMiddleware } from "../../middleware/auth.middleware.ts";
import { logger } from "../../utils/logger.ts";
import type { Route, RouteContext } from "../../types/index.ts";

async function handleGetProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const user = await userService.getUserById(ctx.user.userId);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: user });
  } catch (error) {
    logger.error("Error fetching profile", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleUpdateProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const parsed = updateUserSchema.safeParse(ctx.body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const user = await userService.updateUser(ctx.user.userId, parsed.data);
    return Response.json({ success: true, data: user });
  } catch (error) {
    logger.error("Error updating profile", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const userRoutes: Route[] = [
  {
    method: "GET",
    path: "/users/profile",
    handler: handleGetProfile,
    middleware: [authMiddleware],
  },
  {
    method: "PATCH",
    path: "/users/profile",
    handler: handleUpdateProfile,
    middleware: [authMiddleware],
  },
];
