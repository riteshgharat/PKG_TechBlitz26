import { bookAppointment, getSession } from "../services/backend.api";
import { getCachedSlots } from "./slots.command";

export async function handleBook(
  jid: string,
  args: string[]
): Promise<string> {
  const session = getSession(jid);
  if (!session) {
    return "🔒 You need to register first. Type *register* to get started.";
  }

  if (!session.patientId) {
    return "❌ Patient profile not found. Please contact the clinic.";
  }

  const slotData = getCachedSlots(jid);
  if (!slotData || !slotData.slots.length) {
    return (
      "📋 No slots loaded. Please check available slots first.\n" +
      "Type *slots <doctor number>* to view slots."
    );
  }

  if (!args.length) {
    return "Please specify a slot number.\nExample: *book 2*";
  }

  const slotIdx = parseInt(args[0], 10);
  if (isNaN(slotIdx) || slotIdx < 1 || slotIdx > slotData.slots.length) {
    return `❌ Invalid slot number. Choose between 1 and ${slotData.slots.length}.`;
  }

  const slot = slotData.slots[slotIdx - 1];

  const result = await bookAppointment(session.token, {
    doctorId: slotData.doctorId,
    patientId: session.patientId,
    startTime: slot.startTime,
    endTime: slot.endTime,
  });

  if (!result.success) {
    return `❌ Booking failed: ${result.error || "Unknown error"}`;
  }

  const appt = result.data;
  const startStr = new Date(appt.startTime).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    `✅ *Appointment Confirmed!*\n\n` +
    `🆔 ID: ${appt.id}\n` +
    `🕐 Time: ${startStr}\n` +
    `📋 Status: ${appt.status}\n\n` +
    `To cancel: *cancel ${appt.id}*\n` +
    `To reschedule: *reschedule ${appt.id} <new slot>*`
  );
}
