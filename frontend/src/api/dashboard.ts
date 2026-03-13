import { api } from './client';

export interface AppointmentDoctor {
  id: string;
  name: string;
  specialization: string;
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: 'booked' | 'cancelled' | 'completed' | 'rescheduled';
  doctor: AppointmentDoctor;
}

export interface DashboardStats {
  total: number;
  upcoming: number;
  cancelled: number;
  completed: number;
  lastVisit: string | null;
}

export interface DashboardResponse {
  appointments: Appointment[];
  stats: DashboardStats;
}

export const getDashboardToday = () =>
  api.get<DashboardResponse>('/dashboard/today');
