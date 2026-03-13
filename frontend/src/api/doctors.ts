import { api } from './client';

export interface Doctor {
  id: string;
  name: string;
  phone: string | null;
  specialization: string | null;
  qualifications: string | null;
  experience: number | null;
  consultationFee: number | null;
  bio: string | null;
}

export interface DoctorProfileData {
  name: string;
  specialization?: string;
  qualifications?: string;
  experience?: number;
  consultationFee?: number;
  bio?: string;
}

export const getDoctors = () => api.get<Doctor[]>('/doctors');
export const getDoctorById = (id: string) => api.get<Doctor>(`/doctors/${id}`);
export const getMyDoctorProfile = () => api.get<Doctor>('/doctors/me');
export const saveMyDoctorProfile = (data: DoctorProfileData) =>
  api.post<Doctor>('/doctors/me', data);
export const updateMyDoctorProfile = (data: Partial<DoctorProfileData>) =>
  api.patch<Doctor>('/doctors/me', data);
