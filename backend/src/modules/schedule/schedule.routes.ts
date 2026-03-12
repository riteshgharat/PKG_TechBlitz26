import { createScheduleSchema, updateScheduleSchema } from "./schedule.model.ts";
import * as scheduleService from "./schedule.service.ts";
import { authMiddleware } from "../../middleware/auth.middleware.ts";
import { roleMiddleware } from "../../middleware/role.middleware.ts";
import { logger } from "../../utils/logger.ts";
import type { Route, RouteContext } from "../../types/index.ts";

async function handleGetSchedules(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const doctorId = ctx.query.doctorId;
    if (!doctorId) {
      return Response.json(
        { success: false, error: "doctorId query parameter is required" },
        { status: 400 }
      );
    }
    const schedules = await scheduleService.getSchedulesByDoctorId(doctorId);
    return Response.json({ success: true, data: schedules });
  } catch (error) {
    logger.error("Error fetching schedules", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleCreateSchedule(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const parsed = createScheduleSchema.safeParse(ctx.body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const schedule = await scheduleService.createSchedule(parsed.data);
    return Response.json({ success: true, data: schedule }, { status: 201 });
  } catch (error) {
    logger.error("Error creating schedule", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleUpdateSchedule(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const parsed = updateScheduleSchema.safeParse(ctx.body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const schedule = await scheduleService.updateSchedule(ctx.params.id!, parsed.data);
    return Response.json({ success: true, data: schedule });
  } catch (error) {
    logger.error("Error updating schedule", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleDeleteSchedule(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    await scheduleService.deleteSchedule(ctx.params.id!);
    return Response.json({ success: true, message: "Schedule deleted" });
  } catch (error) {
    logger.error("Error deleting schedule", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const scheduleRoutes: Route[] = [
  {
    method: "GET",
    path: "/schedules",
    handler: handleGetSchedules,
  },
  {
    method: "POST",
    path: "/schedules",
    handler: handleCreateSchedule,
    middleware: [authMiddleware, roleMiddleware("ADMIN", "DOCTOR")],
  },
  {
    method: "PATCH",
    path: "/schedules/:id",
    handler: handleUpdateSchedule,
    middleware: [authMiddleware, roleMiddleware("ADMIN", "DOCTOR")],
  },
  {
    method: "DELETE",
    path: "/schedules/:id",
    handler: handleDeleteSchedule,
    middleware: [authMiddleware, roleMiddleware("ADMIN", "DOCTOR")],
  },
];
