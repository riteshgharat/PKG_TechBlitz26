import { api } from './client';

export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  role: 'doctor' | 'receptionist' | null;
}

export const getUserProfile = () => api.get<UserProfile>('/users/profile');

export const updateUserProfile = (
  name: string,
  role?: 'patient' | 'doctor' | 'receptionist'
) => api.patch<UserProfile>('/users/profile', { name, role });

export const deleteAccount = () => api.delete<{ message: string }>('/users/me');
