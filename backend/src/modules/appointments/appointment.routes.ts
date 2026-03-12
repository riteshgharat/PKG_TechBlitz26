import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
  slotsQuerySchema,
} from "./appointment.model.ts";
import * as appointmentService from "./appointment.service.ts";
import { authMiddleware } from "../../middleware/auth.middleware.ts";
import { logger } from "../../utils/logger.ts";
import type { Route, RouteContext } from "../../types/index.ts";

/**
 * GET /appointments/slots?doctorId=&date=
 */
async function handleGetSlots(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const parsed = slotsQuerySchema.safeParse(ctx.query);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const slots = await appointmentService.getAvailableSlots(parsed.data.doctorId, parsed.data.date);
    return Response.json({ success: true, data: slots });
  } catch (error) {
    logger.error("Error fetching slots", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /appointments/book
 */
async function handleBookAppointment(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const parsed = bookAppointmentSchema.safeParse(ctx.body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const appointment = await appointmentService.bookAppointment(parsed.data);
    return Response.json({ success: true, data: appointment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Booking failed";
    const status = message.includes("conflict") ? 409 : 400;
    logger.error("Error booking appointment", error);
    return Response.json({ success: false, error: message }, { status });
  }
}

/**
 * PATCH /appointments/cancel
 */
async function handleCancelAppointment(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const parsed = cancelAppointmentSchema.safeParse(ctx.body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const appointment = await appointmentService.cancelAppointment(parsed.data.appointmentId);
    return Response.json({ success: true, data: appointment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancellation failed";
    logger.error("Error cancelling appointment", error);
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}

/**
 * PATCH /appointments/reschedule
 */
async function handleRescheduleAppointment(_req: Request, ctx: RouteContext): Promise<Response> {
  try {
    const parsed = rescheduleAppointmentSchema.safeParse(ctx.body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const appointment = await appointmentService.rescheduleAppointment(parsed.data);
    return Response.json({ success: true, data: appointment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reschedule failed";
    const status = message.includes("conflict") ? 409 : 400;
    logger.error("Error rescheduling appointment", error);
    return Response.json({ success: false, error: message }, { status });
  }
}

export const appointmentRoutes: Route[] = [
  {
    method: "GET",
    path: "/appointments/slots",
    handler: handleGetSlots,
  },
  {
    method: "POST",
    path: "/appointments/book",
    handler: handleBookAppointment,
    middleware: [authMiddleware],
  },
  {
    method: "PATCH",
    path: "/appointments/cancel",
    handler: handleCancelAppointment,
    middleware: [authMiddleware],
  },
  {
    method: "PATCH",
    path: "/appointments/reschedule",
    handler: handleRescheduleAppointment,
    middleware: [authMiddleware],
  },
];
