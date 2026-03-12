import * as doctorService from "./doctor.service.ts";
import { logger } from "../../utils/logger.ts";
import type { Route, RouteContext } from "../../types/index.ts";

/**
 * GET /doctors
 */
async function handleGetAllDoctors(_req: Request, _ctx: RouteContext): Promise<Response> {
  try {
    const doctors = await doctorService.getAllDoctors();
    return Response.json({ success: true, data: doctors });
  } catch (error) {
    logger.error("Error fetching doctors", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /doctors/:id
 */
async function handleGetDoctor(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const doctor = await doctorService.getDoctorById(ctx.params.id!);
    if (!doctor) {
      return Response.json({ success: false, error: "Doctor not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: doctor });
  } catch (error) {
    logger.error("Error fetching doctor", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /doctors/:id/schedule
 */
async function handleGetDoctorSchedule(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const doctor = await doctorService.getDoctorById(ctx.params.id!);
    if (!doctor) {
      return Response.json({ success: false, error: "Doctor not found" }, { status: 404 });
    }

    const schedule = await doctorService.getDoctorSchedule(ctx.params.id!);
    return Response.json({ success: true, data: { doctor, schedule } });
  } catch (error) {
    logger.error("Error fetching doctor schedule", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const doctorRoutes: Route[] = [
  {
    method: "GET",
    path: "/doctors",
    handler: handleGetAllDoctors,
  },
  {
    method: "GET",
    path: "/doctors/:id",
    handler: handleGetDoctor,
  },
  {
    method: "GET",
    path: "/doctors/:id/schedule",
    handler: handleGetDoctorSchedule,
  },
];
