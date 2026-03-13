import { api } from './client';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available?: boolean;
}

export const getAvailableSlots = (doctorId: string, date: string) =>
  api.get<TimeSlot[]>(`/appointments/slots?doctorId=${doctorId}&date=${date}`);

export const bookAppointment = (doctorId: string, startTime: string, endTime: string) =>
  api.post<{ appointment: unknown }>('/appointments/book', {
    doctorId,
    startTime,
    endTime,
  });

export const cancelAppointment = (appointmentId: string) =>
  api.patch<{ appointment: unknown }>('/appointments/cancel', { appointmentId });

export const rescheduleAppointment = (
  appointmentId: string,
  startTime: string,
  endTime: string
) =>
  api.patch<{ appointment: unknown }>('/appointments/reschedule', {
    appointmentId,
    startTime,
    endTime,
  });
