// Augmented request context after auth middleware
export interface AuthUser {
  userId: string;
  phone: string;
  role: string;
}

export interface RouteContext {
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  user?: AuthUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type RouteHandler = (req: Request, ctx: RouteContext) => Promise<Response>;

export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  middleware?: Array<(req: Request, ctx: RouteContext) => Promise<RouteContext | Response>>;
}

// Slot representation
export interface TimeSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  available: boolean;
}
