import { handleRequestOtp, handleVerifyOtp } from "./auth.controller.ts";
import type { Route } from "../../types/index.ts";

export const authRoutes: Route[] = [
  {
    method: "POST",
    path: "/auth/request-otp",
    handler: handleRequestOtp,
  },
  {
    method: "POST",
    path: "/auth/verify-otp",
    handler: handleVerifyOtp,
  },
];
