import * as dashboardService from "./dashboard.service.ts";
import { authMiddleware } from "../../middleware/auth.middleware.ts";
import { logger } from "../../utils/logger.ts";
import type { Route, RouteContext } from "../../types/index.ts";

/**
 * GET /dashboard/today
 */
async function handleGetTodayDashboard(_req: Request, _ctx: RouteContext): Promise<Response> {
  try {
    const dashboard = await dashboardService.getTodayDashboard();
    return Response.json({ success: true, data: dashboard });
  } catch (error) {
    logger.error("Error fetching dashboard", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const dashboardRoutes: Route[] = [
  {
    method: "GET",
    path: "/dashboard/today",
    handler: handleGetTodayDashboard,
    middleware: [authMiddleware],
  },
];
