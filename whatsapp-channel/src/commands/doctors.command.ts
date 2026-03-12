import { getDoctors } from "../services/backend.api";

// Cache doctor list for slot/book lookups
let cachedDoctors: any[] = [];

export async function handleDoctors(jid: string): Promise<string> {
  const result = await getDoctors();

  if (!result.success || !result.data?.length) {
    return "😕 No doctors available at the moment. Please try again later.";
  }

  cachedDoctors = result.data;

  let msg = `👨‍⚕️ *Available Doctors:*\n\n`;
  result.data.forEach((doc: any, i: number) => {
    const spec = doc.specialization || "General";
    msg += `${i + 1}. *${doc.name}* — ${spec}\n`;
  });

  msg += `\nTo view slots, type: *slots <number>*\nExample: *slots 1*`;

  return msg;
}

export function getCachedDoctors() {
  return cachedDoctors;
}
