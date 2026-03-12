import { cancelAppointment, getSession } from "../services/backend.api";

export async function handleCancel(
  jid: string,
  args: string[]
): Promise<string> {
  const session = getSession(jid);
  if (!session) {
    return "🔒 You need to register first. Type *register* to get started.";
  }

  if (!args.length) {
    return (
      "Please provide the appointment ID.\n" +
      "Example: *cancel 550e8400-e29b-41d4-a716-446655440000*"
    );
  }

  const appointmentId = args[0];
  const result = await cancelAppointment(session.token, appointmentId);

  if (!result.success) {
    return `❌ Cancel failed: ${result.error || "Unknown error"}`;
  }

  return (
    `✅ *Appointment Cancelled*\n\n` +
    `🆔 ID: ${result.data.id}\n` +
    `📋 Status: ${result.data.status}`
  );
}
