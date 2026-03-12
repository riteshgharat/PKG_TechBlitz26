import { getSlots, getDoctors } from "../services/backend.api";
import { getCachedDoctors } from "./doctors.command";

// Cache available slots per JID for booking
const cachedSlots = new Map<string, { doctorId: string; slots: any[] }>();

export async function handleSlots(
  jid: string,
  args: string[]
): Promise<string> {
  let doctors = getCachedDoctors();

  // If no cached doctors, fetch fresh
  if (!doctors.length) {
    const res = await getDoctors();
    if (!res.success || !res.data?.length) {
      return "😕 No doctors found. Try *doctors* first.";
    }
    doctors = res.data;
  }

  if (!args.length) {
    return (
      `Please specify a doctor number or specialization.\n` +
      `Example: *slots 1* or *slots cardiologist*\n\n` +
      `Type *doctors* to see the list.`
    );
  }

  const input = args.join(" ").toLowerCase();
  let doctor: any = null;

  // Try as a number index
  const idx = parseInt(input, 10);
  if (!isNaN(idx) && idx >= 1 && idx <= doctors.length) {
    doctor = doctors[idx - 1];
  } else {
    // Try matching by specialization or name
    doctor = doctors.find(
      (d: any) =>
        d.specialization?.toLowerCase().includes(input) ||
        d.name.toLowerCase().includes(input)
    );
  }

  if (!doctor) {
    return (
      `❌ Doctor not found for "${args.join(" ")}"\n` +
      `Type *doctors* to see available doctors.`
    );
  }

  // Use today's date
  const today = new Date().toISOString().split("T")[0];
  const result = await getSlots(doctor.id, today);

  if (!result.success) {
    return `❌ Failed to fetch slots: ${result.error || "Unknown error"}`;
  }

  const availableSlots = (result.data || []).filter((s: any) => s.available);

  if (!availableSlots.length) {
    return (
      `📅 No available slots for *${doctor.name}* today (${today}).\n` +
      `The doctor may not be working today or all slots are booked.`
    );
  }

  // Cache for booking
  cachedSlots.set(jid, { doctorId: doctor.id, slots: availableSlots });

  let msg = `📅 *Available slots for Dr. ${doctor.name}* (${today}):\n\n`;
  availableSlots.forEach((slot: any, i: number) => {
    const start = new Date(slot.startTime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const end = new Date(slot.endTime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    msg += `${i + 1}. 🕐 ${start} — ${end}\n`;
  });

  msg += `\nTo book, type: *book <slot number>*\nExample: *book 2*`;

  return msg;
}

export function getCachedSlots(jid: string) {
  return cachedSlots.get(jid);
}
