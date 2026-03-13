import type { RouteContext } from "../types/index.ts";

/**
 * Role middleware factory — restricts access to specific roles
 */
export function roleMiddleware(...allowedRoles: string[]) {
  return async (
    _req: Request,
    ctx: RouteContext
  ): Promise<RouteContext | Response> => {
    if (!ctx.user) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const normalizedUserRole = String(ctx.user.role).toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return Response.json(
        {
          success: false,
          error: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        },
        { status: 403 }
      );
    }

    return ctx;
  };
}
