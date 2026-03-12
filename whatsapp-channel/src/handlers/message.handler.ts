import { WAClient } from "../connection/wpweb.client";
import { handleHi } from "../commands/hi.command";
import { handleRegister } from "../commands/register.command";
import { handleDoctors } from "../commands/doctors.command";
import { handleSlots } from "../commands/slots.command";
import { handleBook } from "../commands/book.command";
import { handleCancel } from "../commands/cancel.command";
import { handleReschedule } from "../commands/reschedule.command";

type CommandHandler = (jid: string, args: string[]) => Promise<string>;

const commands: Record<string, CommandHandler> = {
  hi: (jid) => handleHi(jid),
  hello: (jid) => handleHi(jid),
  menu: (jid) => handleHi(jid),
  register: (jid, args) => handleRegister(jid, args),
  doctors: (jid) => handleDoctors(jid),
  slots: (jid, args) => handleSlots(jid, args),
  book: (jid, args) => handleBook(jid, args),
  cancel: (jid, args) => handleCancel(jid, args),
  reschedule: (jid, args) => handleReschedule(jid, args),
};

export async function handleMessage(client: WAClient, msg: any) {
  // Get the chat ID (JID equivalent)
  const jid = msg.from;
  if (!jid) return;

  // Get message text
  const text = msg.body;
  if (!text) return;

  const trimmed = text.trim();
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = commands[command];

  if (!handler) {
    // If unrecognized command, show help
    const reply =
      `🤖 I didn't understand that.\n\n` +
      `Type *hi* to see available commands.`;
    await msg.reply(reply);
    return;
  }

  try {
    const reply = await handler(jid, args);
    await msg.reply(reply);
  } catch (err: any) {
    console.error(`Error handling command "${command}":`, err);
    await msg.reply("⚠️ Something went wrong. Please try again later.");
  }
}
