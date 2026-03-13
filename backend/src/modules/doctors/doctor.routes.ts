import * as doctorService from "./doctor.service.ts";
import { authMiddleware } from "../../middleware/auth.middleware.ts";
import { logger } from "../../utils/logger.ts";
import type { Route, RouteContext } from "../../types/index.ts";

async function handleGetAllDoctors(_req: Request, _ctx: RouteContext): Promise<Response> {
  try {
    const doctors = await doctorService.getAllDoctors();
    return Response.json({ success: true, data: doctors });
  } catch (error) {
    logger.error("Error fetching doctors", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleGetDoctor(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const doctor = await doctorService.getDoctorById(ctx.params.id!);
    if (!doctor) return Response.json({ success: false, error: "Doctor not found" }, { status: 404 });
    return Response.json({ success: true, data: doctor });
  } catch (error) {
    logger.error("Error fetching doctor", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleGetDoctorSchedule(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const doctor = await doctorService.getDoctorById(ctx.params.id!);
    if (!doctor) return Response.json({ success: false, error: "Doctor not found" }, { status: 404 });
    const schedule = await doctorService.getDoctorSchedule(ctx.params.id!);
    return Response.json({ success: true, data: { doctor, schedule } });
  } catch (error) {
    logger.error("Error fetching doctor schedule", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleGetMyProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const doctor = await doctorService.getDoctorByPhone(ctx.user.phone);
    if (!doctor) return Response.json({ success: false, error: "Doctor profile not found" }, { status: 404 });
    return Response.json({ success: true, data: doctor });
  } catch (error) {
    logger.error("Error fetching doctor profile", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleUpsertMyProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { name, specialization, qualifications, experience, consultationFee, bio } = ctx.body as Record<string, unknown>;
    if (!name || typeof name !== "string") {
      return Response.json({ success: false, error: "name is required" }, { status: 400 });
    }
    const doctor = await doctorService.createOrUpdateDoctorProfile(ctx.user.phone, {
      name,
      specialization: typeof specialization === "string" ? specialization : undefined,
      qualifications: typeof qualifications === "string" ? qualifications : undefined,
      experience: experience !== undefined ? Number(experience) : undefined,
      consultationFee: consultationFee !== undefined ? Number(consultationFee) : undefined,
      bio: typeof bio === "string" ? bio : undefined,
    });
    return Response.json({ success: true, data: doctor });
  } catch (error) {
    logger.error("Error upserting doctor profile", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

async function handleUpdateMyProfile(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    if (!ctx.user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = ctx.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = String(body.name);
    if (body.specialization !== undefined) updates.specialization = String(body.specialization);
    if (body.qualifications !== undefined) updates.qualifications = String(body.qualifications);
    if (body.experience !== undefined) updates.experience = Number(body.experience);
    if (body.consultationFee !== undefined) updates.consultationFee = Number(body.consultationFee);
    if (body.bio !== undefined) updates.bio = String(body.bio);
    const doctor = await doctorService.updateDoctorProfile(
      ctx.user.phone,
      updates as Parameters<typeof doctorService.updateDoctorProfile>[1]
    );
    return Response.json({ success: true, data: doctor });
  } catch (error) {
    logger.error("Error updating doctor profile", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const doctorRoutes: Route[] = [
  { method: "GET",   path: "/doctors",             handler: handleGetAllDoctors },
  { method: "GET",   path: "/doctors/me",           handler: handleGetMyProfile,    middleware: [authMiddleware] },
  { method: "POST",  path: "/doctors/me",           handler: handleUpsertMyProfile, middleware: [authMiddleware] },
  { method: "PATCH", path: "/doctors/me",           handler: handleUpdateMyProfile, middleware: [authMiddleware] },
  { method: "GET",   path: "/doctors/:id",          handler: handleGetDoctor },
  { method: "GET",   path: "/doctors/:id/schedule", handler: handleGetDoctorSchedule },
];
