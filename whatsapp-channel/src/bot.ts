import { connectToWhatsApp } from "./connection/wpweb.client";
import { handleMessage } from "./handlers/message.handler";

console.log("🏥 Smart Clinic WhatsApp Bot starting...");
console.log(`📡 Backend API: ${process.env.BACKEND_URL || "http://localhost:3001"}`);
console.log("🔄 Initializing WhatsApp connection...");

connectToWhatsApp((client, msg) => {
  handleMessage(client, msg);
});
