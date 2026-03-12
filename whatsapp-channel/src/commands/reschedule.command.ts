import { rescheduleAppointment, getSession } from "../services/backend.api";
import { getCachedSlots } from "./slots.command";

export async function handleReschedule(
  jid: string,
  args: string[]
): Promise<string> {
  const session = getSession(jid);
  if (!session) {
    return "🔒 You need to register first. Type *register* to get started.";
  }

  if (args.length < 2) {
    return (
      "Please provide the appointment ID and new slot number.\n" +
      "Example: *reschedule <appointment-id> 3*\n\n" +
      "Make sure to run *slots <doctor>* first to see available times."
    );
  }

  const appointmentId = args[0];
  const slotIdx = parseInt(args[1], 10);

  const slotData = getCachedSlots(jid);
  if (!slotData || !slotData.slots.length) {
    return (
      "📋 No slots loaded. Please check available slots first.\n" +
      "Type *slots <doctor number>* to view slots."
    );
  }

  if (isNaN(slotIdx) || slotIdx < 1 || slotIdx > slotData.slots.length) {
    return `❌ Invalid slot number. Choose between 1 and ${slotData.slots.length}.`;
  }

  const slot = slotData.slots[slotIdx - 1];

  const result = await rescheduleAppointment(session.token, {
    appointmentId,
    newStartTime: slot.startTime,
    newEndTime: slot.endTime,
  });

  if (!result.success) {
    return `❌ Reschedule failed: ${result.error || "Unknown error"}`;
  }

  const appt = result.data;
  const startStr = new Date(appt.startTime).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    `✅ *Appointment Rescheduled!*\n\n` +
    `🆔 ID: ${appt.id}\n` +
    `🕐 New Time: ${startStr}\n` +
    `📋 Status: ${appt.status}`
  );
}
