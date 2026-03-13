import { api } from './client';

export interface PatientProfile {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  address: string | null;
  medicalHistory: string | null;
  language: string | null;
}

export interface PatientRegisterData {
  name: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  medicalHistory?: string;
}

export const getPatientProfile = () =>
  api.get<PatientProfile>('/patients/profile');

export const registerPatient = (data: PatientRegisterData) =>
  api.post<PatientProfile>('/patients/profile', data);

export const updatePatientProfile = (data: Partial<PatientRegisterData>) =>
  api.patch<PatientProfile>('/patients/profile', data);
