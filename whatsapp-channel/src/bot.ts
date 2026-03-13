import { createServer } from "http";
import { connectToWhatsApp, getClient } from "./connection/wpweb.client";
import { handleMessage } from "./handlers/message.handler";

const SEND_PORT = parseInt(process.env.SEND_PORT || "3002", 10);

// ─── HTTP server so the backend can push OTP messages via WhatsApp ────────────
const httpServer = createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/send-message") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const { phone, message } = JSON.parse(body);
      if (!phone || !message) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "phone and message are required" }));
        return;
      }

      const client = getClient();
      if (!client) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "WhatsApp client not ready yet. Scan the QR code first." }));
        return;
      }

      // Build WhatsApp JID — strip non-digits, prefix 91 for Indian numbers
      const digits = phone.replace(/\D/g, "");
      const jid = digits.length === 10 ? `91${digits}@c.us` : `${digits}@c.us`;

      await client.sendMessage(jid, message);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err?.message || "Internal error" }));
    }
  });
});

httpServer.listen(SEND_PORT, () => {
  console.log(`📨 Message-send server listening on http://localhost:${SEND_PORT}`);
});

// ─── WhatsApp Bot ─────────────────────────────────────────────────────────────
console.log("🏥 Clinico WhatsApp Bot starting...");
console.log(`📡 Backend API: ${process.env.BACKEND_URL || "http://localhost:3001"}`);
console.log("🔄 Initializing WhatsApp connection...");

connectToWhatsApp((client, msg) => {
  handleMessage(client, msg);
});

