const BASE_URL = '/api';

export function getToken(): string | null {
  return localStorage.getItem('clinico_token');
}

export function setToken(token: string): void {
  localStorage.setItem('clinico_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('clinico_token');
}

/** Decode the JWT role claim without verification (verification is backend's job). */
export function getRoleFromToken(): 'patient' | 'doctor' | 'receptionist' {
  const token = getToken();
  if (!token) return 'patient';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = (payload.role || 'PATIENT').toLowerCase();
    if (role === 'doctor') return 'doctor';
    if (role === 'receptionist') return 'receptionist';
    return 'patient';
  } catch {
    return 'patient';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${res.status}`);
  }
  // Backend wraps all success responses as { success: true, data: {...} }
  return (json.data !== undefined ? json.data : json) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
