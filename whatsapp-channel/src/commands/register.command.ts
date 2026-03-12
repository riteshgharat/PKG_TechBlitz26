import {
  requestOtp,
  verifyOtp,
  setSession,
  getPatientProfile,
} from "../services/backend.api";

// Temporary store for pending registrations (jid -> phone)
const pendingOtp = new Map<string, string>();

export async function handleRegister(
  jid: string,
  args: string[]
): Promise<string> {
  // Extract phone from WhatsApp JID (format: 91XXXXXXXXXX@c.us)
  const waPhone = jid.split("@")[0];
  // Normalize: remove country code prefix if 12 digits (91 + 10 digits)
  const phone =
    waPhone.length === 12 && waPhone.startsWith("91")
      ? waPhone.slice(2)
      : waPhone;

  // If user provided an OTP as argument, verify it
  if (pendingOtp.has(jid) && args.length === 1 && /^\d{6}$/.test(args[0])) {
    const otp = args[0];
    const storedPhone = pendingOtp.get(jid)!;

    const result = await verifyOtp(storedPhone, otp);
    if (!result.success) {
      return `❌ OTP verification failed: ${result.error || "Invalid OTP"}`;
    }

    pendingOtp.delete(jid);

    // Store session
    setSession(jid, {
      token: result.data.token,
      phone: storedPhone,
    });

    // Try to fetch patient profile to get patientId
    const profile = await getPatientProfile(result.data.token);
    if (profile.success && profile.data?.id) {
      setSession(jid, {
        token: result.data.token,
        phone: storedPhone,
        patientId: profile.data.id,
      });
    }

    const name = result.data.user?.name || "Patient";
    return (
      `✅ *Registration successful!*\n\n` +
      `Welcome, ${name}!\n` +
      `You are now logged in. Use *doctors* to view available doctors.`
    );
  }

  // Step 1: Request OTP
  const otpResult = await requestOtp(phone);
  if (!otpResult.success) {
    return `❌ Failed to send OTP: ${otpResult.error || "Unknown error"}`;
  }

  pendingOtp.set(jid, phone);

  let msg =
    `📲 *OTP sent to ${phone}*\n\n` +
    `Reply with: *register <6-digit OTP>*\n` +
    `Example: register 123456`;

  // In dev mode, show the OTP
  if (otpResult.data?.otp) {
    msg += `\n\n🔑 Dev OTP: *${otpResult.data.otp}*`;
  }

  return msg;
}
