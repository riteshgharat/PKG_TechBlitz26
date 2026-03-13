import { api } from './client';

export interface OtpRequestResponse {
  message: string;
  otp?: string; // returned in development mode
}

export interface OtpVerifyResponse {
  token: string;
  user: {
    id: string;
    phone: string;
    name: string | null;
    role: string | null;
  };
  isNewUser: boolean;
}

export const requestOtp = (phone: string) =>
  api.post<OtpRequestResponse>('/auth/request-otp', { phone });

export const verifyOtp = (phone: string, otp: string) =>
  api.post<OtpVerifyResponse>('/auth/verify-otp', { phone, otp });
