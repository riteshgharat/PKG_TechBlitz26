import { api } from './client';

export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  role: string | null;
}

export const getUserProfile = () => api.get<UserProfile>('/users/profile');

export const updateUserProfile = (name: string) =>
  api.patch<UserProfile>('/users/profile', { name });

export const deleteAccount = () => api.delete<{ message: string }>('/users/me');
