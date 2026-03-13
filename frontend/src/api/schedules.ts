import { api } from './client'

export interface DoctorSchedule {
  id: string
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number | null
}

export interface SchedulePayload {
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration?: number
}

export interface ScheduleUpdatePayload {
  startTime?: string
  endTime?: string
  slotDuration?: number
}

export const getSchedules = (doctorId: string) =>
  api.get<DoctorSchedule[]>(`/schedules?doctorId=${encodeURIComponent(doctorId)}`)

export const createSchedule = (payload: SchedulePayload) =>
  api.post<DoctorSchedule>('/schedules', payload)

export const updateSchedule = (id: string, payload: ScheduleUpdatePayload) =>
  api.patch<DoctorSchedule>(`/schedules/${id}`, payload)

export const deleteSchedule = (id: string) =>
  api.delete<{ message: string }>(`/schedules/${id}`)