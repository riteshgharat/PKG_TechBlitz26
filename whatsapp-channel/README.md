# 📱 WhatsApp Bot for Smart Clinic

WhatsApp automation bot built with **Baileys** that connects to the Clinic Scheduling Backend API.

---

## Prerequisites

- **Node.js** v20+ (Baileys requires Node.js, not Bun)
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
```

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

The bot will save authentication in `auth_info/` folder for future runs.

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

Bot: 🏥 Welcome to Smart Clinic!
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
- Delete `auth_info/` folder and retry
- Check terminal supports QR code rendering

### Connection Errors (428, 405)

These errors occur when using Bun. Always use Node.js with Baileys:

```bash
# ❌ Don't use bun
bun run src/bot.ts

# ✅ Use npm/node
npm start
```

### Backend Connection Failed

- Ensure backend is running: `cd ../backend && bun run dev`
- Check `BACKEND_URL` in `.env` matches backend port
- Verify backend database is set up: `bunx prisma db push`

---

## Project Structure

```
whatsapp-channel/
├── src/
│   ├── bot.ts                      # Entry point
│   ├── connection/
│   │   └── baileys.client.ts       # WhatsApp connection with Baileys
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
├── auth_info/                      # WhatsApp session data (auto-generated)
├── package.json
└── .env
```

---

## Tech Stack

- **Baileys** — WhatsApp Web API
- **Node.js** — JavaScript runtime
- **TypeScript** — Type safety
- **tsx** — TypeScript executor

---

## Notes

- Phone numbers are automatically extracted from WhatsApp JID
- JWT tokens are stored in-memory (reset on bot restart)
- Slot cache is per-user for booking
- Bot uses backend's OTP system for authentication
