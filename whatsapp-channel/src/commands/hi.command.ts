export async function handleHi(jid: string): Promise<string> {
  return (
    `🏥 *Welcome to Clinico!*\n\n` +
    `Please choose your language:\n` +
    `1️⃣ English\n` +
    `2️⃣ Hindi\n\n` +
    `Available commands:\n` +
    `▸ *register* — Register with your name\n` +
    `▸ *doctors* — View available doctors\n` +
    `▸ *slots <doctor number>* — View available slots\n` +
    `▸ *book <slot number>* — Book an appointment\n` +
    `▸ *cancel <appointment id>* — Cancel appointment\n` +
    `▸ *reschedule <appointment id> <slot number>* — Reschedule\n` +
    `▸ *hi* — Show this menu`
  );
}
