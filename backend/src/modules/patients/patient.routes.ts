import * as patientService from "./patient.service.ts";
import { authMiddleware } from "../../middleware/auth.middleware.ts";
import { logger } from "../../utils/logger.ts";
import type { Route, RouteContext } from "../../types/index.ts";

async function handleGetPatientProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    // Look up patient by phone (same phone as user)
    const patient = await patientService.getPatientByPhone(ctx.user.phone);
    if (!patient) {
      return Response.json({ success: false, error: "Patient profile not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: patient });
  } catch (error) {
    logger.error("Error fetching patient profile", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleGetAllPatients(_req: Request, _ctx: RouteContext): Promise<Response> {
  try {
    const patients = await patientService.getAllPatients();
    return Response.json({ success: true, data: patients });
  } catch (error) {
    logger.error("Error fetching patients", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const patientRoutes: Route[] = [
  {
    method: "GET",
    path: "/patients/profile",
    handler: handleGetPatientProfile,
    middleware: [authMiddleware],
  },
  {
    method: "GET",
    path: "/patients",
    handler: handleGetAllPatients,
  },
];
