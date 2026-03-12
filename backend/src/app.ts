import { logger } from "./utils/logger.ts";
import type { Route, RouteContext } from "./types/index.ts";

// Import all routes
import { authRoutes } from "./modules/auth/auth.routes.ts";
import { userRoutes } from "./modules/users/user.routes.ts";
import { doctorRoutes } from "./modules/doctors/doctor.routes.ts";
import { patientRoutes } from "./modules/patients/patient.routes.ts";
import { scheduleRoutes } from "./modules/schedule/schedule.routes.ts";
import { appointmentRoutes } from "./modules/appointments/appointment.routes.ts";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.ts";

// Combine all routes
const allRoutes: Route[] = [
  ...authRoutes,
  ...userRoutes,
  ...doctorRoutes,
  ...patientRoutes,
  ...scheduleRoutes,
  ...appointmentRoutes,
  ...dashboardRoutes,
];

/**
 * Match a URL path against a route pattern (supports :param placeholders)
 */
function matchRoute(
  pattern: string,
  pathname: string
): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const pat = patternParts[i]!;
    const path = pathParts[i]!;

    if (pat.startsWith(":")) {
      params[pat.slice(1)] = path;
    } else if (pat !== path) {
      return null;
    }
  }

  return params;
}

/**
 * Parse query string into a record
 */
function parseQuery(url: URL): Record<string, string> {
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

/**
 * Parse request body (JSON)
 */
async function parseBody(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      return await req.json();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Main request handler
 */
export async function handleRequest(req: Request): Promise<Response> {
  const startTime = Date.now();
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const pathname = url.pathname;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return addCorsHeaders(
      new Response(null, { status: 204 })
    );
  }

  // Health check
  if (pathname === "/health" && method === "GET") {
    return addCorsHeaders(
      Response.json({ status: "ok", timestamp: new Date().toISOString() })
    );
  }

  // Find matching route
  for (const route of allRoutes) {
    if (route.method !== method) continue;

    const params = matchRoute(route.path, pathname);
    if (!params) continue;

    // Build context
    const query = parseQuery(url);
    const body = await parseBody(req);
    let ctx: RouteContext = { params, query, body };

    // Run middleware chain
    if (route.middleware) {
      for (const mw of route.middleware) {
        const result = await mw(req, ctx);
        if (result instanceof Response) {
          const elapsed = Date.now() - startTime;
          logger.info(`${method} ${pathname} → ${result.status} (${elapsed}ms)`);
          return addCorsHeaders(result);
        }
        ctx = result;
      }
    }

    // Run handler
    const response = await route.handler(req, ctx);
    const elapsed = Date.now() - startTime;
    logger.info(`${method} ${pathname} → ${response.status} (${elapsed}ms)`);
    return addCorsHeaders(response);
  }

  // 404
  const elapsed = Date.now() - startTime;
  logger.warn(`${method} ${pathname} → 404 (${elapsed}ms)`);
  return addCorsHeaders(
    Response.json(
      { success: false, error: `Route not found: ${method} ${pathname}` },
      { status: 404 }
    )
  );
}
