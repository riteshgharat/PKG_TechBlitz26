// @ts-ignore - whatsapp-web.js doesn't have proper ESM exports
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
// @ts-ignore
import qrcode from "qrcode-terminal";

export type WAClient = InstanceType<typeof Client>;

let client: WAClient | null = null;

export async function connectToWhatsApp(
  onMessage: (client: WAClient, msg: any) => void
): Promise<WAClient> {
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: "./auth_info",
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    },
  });

  client.on("qr", (qr: string) => {
    console.log("📱 Scan the QR code below to connect WhatsApp:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp bot connected successfully!");
  });

  client.on("authenticated", () => {
    console.log("🔐 Authentication successful!");
  });

  client.on("auth_failure", (msg: string) => {
    console.error("❌ Authentication failed:", msg);
  });

  client.on("disconnected", (reason: string) => {
    console.log(`❌ Disconnected: ${reason}`);
    console.log("🔄 Attempting to reconnect...");
    client?.initialize();
  });

  client.on("message", async (msg: any) => {
    if (msg.fromMe) return;
    onMessage(client!, msg);
  });

  await client.initialize();

  return client;
}

export function getClient(): WAClient | null {
  return client;
}
