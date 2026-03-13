import * as patientService from "./patient.service.ts";
import { authMiddleware } from "../../middleware/auth.middleware.ts";
import { logger } from "../../utils/logger.ts";
import type { Route, RouteContext } from "../../types/index.ts";

async function handleGetPatientProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const patient = await patientService.getPatientByPhone(ctx.user.phone);
    if (!patient) return Response.json({ success: false, error: "Patient profile not found" }, { status: 404 });
    return Response.json({ success: true, data: patient });
  } catch (error) {
    logger.error("Error fetching patient profile", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleCreatePatientProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { name, age, gender, bloodGroup, address, medicalHistory } = ctx.body as Record<string, unknown>;
    if (!name || typeof name !== "string") {
      return Response.json({ success: false, error: "name is required" }, { status: 400 });
    }
    const existing = await patientService.getPatientByPhone(ctx.user.phone);
    if (existing) {
      return Response.json({ success: false, error: "Patient profile already exists. Use PATCH to update." }, { status: 409 });
    }
    const patient = await patientService.createPatient(ctx.user.phone, {
      name,
      age: age !== undefined ? Number(age) : undefined,
      gender: typeof gender === "string" ? gender : undefined,
      bloodGroup: typeof bloodGroup === "string" ? bloodGroup : undefined,
      address: typeof address === "string" ? address : undefined,
      medicalHistory: typeof medicalHistory === "string" ? medicalHistory : undefined,
    });
    return Response.json({ success: true, data: patient }, { status: 201 });
  } catch (error) {
    logger.error("Error creating patient profile", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleUpdatePatientProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { name, age, gender, bloodGroup, address, medicalHistory } = ctx.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = String(name);
    if (age !== undefined) updates.age = Number(age);
    if (gender !== undefined) updates.gender = String(gender);
    if (bloodGroup !== undefined) updates.bloodGroup = String(bloodGroup);
    if (address !== undefined) updates.address = String(address);
    if (medicalHistory !== undefined) updates.medicalHistory = String(medicalHistory);
    const patient = await patientService.updatePatient(ctx.user.phone, updates as Parameters<typeof patientService.updatePatient>[1]);
    return Response.json({ success: true, data: patient });
  } catch (error) {
    logger.error("Error updating patient profile", error);
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
  { method: "GET",   path: "/patients/profile", handler: handleGetPatientProfile,   middleware: [authMiddleware] },
  { method: "POST",  path: "/patients/profile", handler: handleCreatePatientProfile, middleware: [authMiddleware] },
  { method: "PATCH", path: "/patients/profile", handler: handleUpdatePatientProfile, middleware: [authMiddleware] },
  { method: "GET",   path: "/patients",          handler: handleGetAllPatients },
];
