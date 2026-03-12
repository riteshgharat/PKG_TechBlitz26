const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// In-memory store: whatsapp JID -> { token, patientId, phone }
const sessionStore = new Map<
  string,
  { token: string; patientId?: string; phone: string }
>();

async function request(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Auth ──────────────────────────────────────────────

export async function requestOtp(phone: string) {
  return request("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, otp: string) {
  return request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
}

// ─── Doctors ───────────────────────────────────────────

export async function getDoctors() {
  return request("/doctors");
}

export async function getDoctorById(id: string) {
  return request(`/doctors/${encodeURIComponent(id)}`);
}

// ─── Slots ─────────────────────────────────────────────

export async function getSlots(doctorId: string, date: string) {
  return request(
    `/appointments/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`
  );
}

// ─── Appointments ──────────────────────────────────────

export async function bookAppointment(
  token: string,
  body: {
    doctorId: string;
    patientId: string;
    startTime: string;
    endTime: string;
  }
) {
  return request("/appointments/book", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function cancelAppointment(
  token: string,
  appointmentId: string
) {
  return request("/appointments/cancel", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ appointmentId }),
  });
}

export async function rescheduleAppointment(
  token: string,
  body: {
    appointmentId: string;
    newStartTime: string;
    newEndTime: string;
  }
) {
  return request("/appointments/reschedule", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

// ─── Patients ──────────────────────────────────────────

export async function getPatientProfile(token: string) {
  return request("/patients/profile", {
    headers: authHeaders(token),
  });
}

export async function getAllPatients() {
  return request("/patients");
}

// ─── Session Store ─────────────────────────────────────

export function getSession(jid: string) {
  return sessionStore.get(jid);
}

export function setSession(
  jid: string,
  data: { token: string; patientId?: string; phone: string }
) {
  sessionStore.set(jid, data);
}

export function hasSession(jid: string): boolean {
  return sessionStore.has(jid);
}
