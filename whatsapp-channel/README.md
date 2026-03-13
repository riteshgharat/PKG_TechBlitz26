# 📱 WhatsApp Channel for Clinico

WhatsApp bot built with **whatsapp-web.js** that:
1. Provides WhatsApp-based appointment booking interface
2. Delivers OTP messages for web app authentication via HTTP API

---

## Features

- **QR Code Authentication** — Link WhatsApp via QR scan (Puppeteer-based)
- **Bot Commands** — Register, view doctors, book/cancel/reschedule appointments
- **HTTP API Server** — Receive OTP delivery requests from backend
- **Session Persistence** — Stores WhatsApp auth in `.wwebjs_auth/` folder

---

## Prerequisites

- **Node.js** v20+ (whatsapp-web.js requires Node.js, not Bun)
- **Chromium/Chrome** (auto-installed by Puppeteer)
- Backend API running at `http://localhost:3001`

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env` file if needed:

```env
BACKEND_URL=http://localhost:3001
PORT=3002
```

The bot runs an HTTP server on `PORT` (default: 3002) for OTP delivery.

### 3. Start the Bot

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

---

## First Run

When you start the bot, a **QR code** will appear in the terminal.

1. Open WhatsApp on your phone
2. Go to **Settings → Linked Devices → Link a Device**
3. Scan the QR code

The bot will save authentication in `.wwebjs_auth/` folder for future runs.

---

## HTTP API

The bot exposes an HTTP server on port `3002` (configurable via `PORT` env var).

### Endpoints

#### `POST /send-message`

Send a WhatsApp message to a phone number.

**Request:**
```json
{
  "to": "919876543210@s.whatsapp.net",
  "message": "🏥 Your Clinico OTP is: 123456\n\nValid for 5 minutes."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message sent"
}
```

**Response (503 Service Unavailable):**
```json
{
  "success": false,
  "error": "WhatsApp client not ready"
}
```

**Usage:** The backend calls this endpoint to deliver OTPs via WhatsApp.

---

## Commands

Send these commands via WhatsApp:

| Command | Description | Example |
|---------|-------------|---------|
| `hi` | Show welcome menu | `hi` |
| `register` | Register & get OTP | `register` then `register 123456` |
| `doctors` | List all doctors | `doctors` |
| `slots <number>` | View available slots | `slots 1` or `slots cardiologist` |
| `book <slot>` | Book an appointment | `book 2` |
| `cancel <id>` | Cancel appointment | `cancel <appointment-id>` |
| `reschedule <id> <slot>` | Reschedule appointment | `reschedule <id> 3` |

---

## Example Flow

```
User: hi

Bot: 🏥 Welcome to Clinico!
     Choose your language:
     1️⃣ English
     2️⃣ Hindi
     
     Available commands:
     ▸ register — Register with your name
     ▸ doctors — View available doctors
     ...

User: register

Bot: 📲 OTP sent to 9876543210
     Reply with: register <6-digit OTP>
     🔑 Dev OTP: 123456

User: register 123456

Bot: ✅ Registration successful!
     Welcome, John Doe!

User: doctors

Bot: 👨‍⚕️ Available Doctors:
     1. Dr. Smith — Cardiologist
     2. Dr. Jones — General
     
     To view slots, type: slots <number>

User: slots 1

Bot: 📅 Available slots for Dr. Smith (2026-03-12):
     1. 🕐 09:00 AM — 09:30 AM
     2. 🕐 09:30 AM — 10:00 AM
     3. 🕐 10:00 AM — 10:30 AM
     
     To book, type: book <slot number>

User: book 2

Bot: ✅ Appointment Confirmed!
     🆔 ID: 550e8400-e29b-41d4-a716-446655440000
     🕐 Time: 09:30 AM
     📋 Status: booked
```

---

## Troubleshooting

### QR Code Not Showing

- Make sure you're using **Node.js** (not Bun)
- Delete `.wwebjs_auth/` folder and retry
- Check terminal supports QR code rendering
- Ensure Chromium is installed (auto-installed by Puppeteer)

### Connection Errors

- Make sure no other WhatsApp Web session is active
- Try deleting `.wwebjs_auth/` and re-authenticating
- Ensure you have a stable internet connection

### Backend Connection Failed

- Ensure backend is running: `cd ../backend && bun run dev`
- Check `BACKEND_URL` in `.env` matches backend port
- Verify backend database is set up: `bunx prisma db push`

---

## Project Structure

```
whatsapp-channel/
├── src/
│   ├── bot.ts                      # Entry point + HTTP server
│   ├── connection/
│   │   └── baileys.client.ts       # WhatsApp connection (deprecated)
│   ├── handlers/
│   │   └── message.handler.ts      # Routes messages to commands
│   ├── services/
│   │   └── backend.api.ts          # HTTP client + session store
│   └── commands/
│       ├── hi.command.ts           # Welcome message
│       ├── register.command.ts     # OTP registration
│       ├── doctors.command.ts      # List doctors
│       ├── slots.command.ts        # View slots
│       ├── book.command.ts         # Book appointment
│       ├── cancel.command.ts       # Cancel appointment
│       └── reschedule.command.ts   # Reschedule appointment
├── .wwebjs_auth/                   # WhatsApp session data (auto-generated)
├── package.json
└── .env
```

---

## Tech Stack

- **whatsapp-web.js** — WhatsApp Web API
- **Puppeteer** — Chromium automation for WhatsApp Web
- **Node.js** — JavaScript runtime
- **TypeScript** — Type safety
- **tsx** — TypeScript executor

---

## Integration with Backend

The backend (`http://localhost:3001`) sends HTTP requests to this service to deliver OTPs:

**Backend Code (otp.service.ts):**
```typescript
// After generating OTP
const whatsappUrl = process.env.WHATSAPP_SERVICE_URL;
if (whatsappUrl) {
  fetch(`${whatsappUrl}/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: `91${phone}@s.whatsapp.net`,
      message: `🏥 Your Clinico OTP is: ${otp}\n\nValid for ${OTP_EXPIRY_MINUTES} minutes.`
    })
  }).catch(error => console.error('WhatsApp delivery failed:', error));
}
```

**Backend .env:**
```env
WHATSAPP_SERVICE_URL="http://localhost:3002"
```

---

## Notes

- Phone numbers are automatically extracted from WhatsApp JID
- JWT tokens are stored in-memory (reset on bot restart)
- Slot cache is per-user for booking
- Bot uses backend's OTP system for authentication
