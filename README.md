# 🏥 Clinico — Healthcare Management System

Full-stack clinic scheduling and management platform with **multi-channel support** (Web + WhatsApp).

Built for **TechBlitz 2026 Hackathon** by Team PKG.

---

## System Overview

**Clinico** is a comprehensive healthcare management system with three distinct user roles:
- **Patients** — Book appointments, view history, manage profile
- **Doctors** — Manage schedule, view appointments, update profile
- **Receptionists** — Monitor all appointments, search/filter, manage operations

### Architecture

```
┌─────────────────┐       ┌─────────────────┐
│  React Frontend │ ◄───► │  Bun Backend    │
│  (Port 5173)    │       │  (Port 3001)    │
└─────────────────┘       └────────┬────────┘
                                   │
                          ┌────────┴────────┐
                          │   PostgreSQL    │
                          │    Database     │
                          └─────────────────┘
                                   ▲
                                   │
                          ┌────────┴────────┐
                          │ WhatsApp Bot    │
                          │  (Port 3002)    │
                          └─────────────────┘
```

---

## Features

### Core Features
- **Phone-based OTP Authentication** — No passwords, JWT tokens
- **Role-based Access Control** — Patient/Doctor/Receptionist roles
- **Multi-step Registration** — Collect detailed profiles during onboarding
- **Real-time Dashboard** — View appointments, stats, and schedules
- **Smart Appointment Booking** — Conflict detection, rescheduling, cancellation
- **Profile Management** — Edit personal, professional, and medical info
- **WhatsApp Integration** — OTP delivery via WhatsApp bot

### Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Bun + TypeScript + Prisma |
| **Database** | PostgreSQL |
| **WhatsApp** | whatsapp-web.js + Puppeteer |
| **Auth** | JWT + OTP (phone-based) |

---

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) v1.0+
- [Node.js](https://nodejs.org) v20+ (for WhatsApp bot)
- [PostgreSQL](https://www.postgresql.org/) 14+

### 1. Backend Setup

```bash
cd backend
bun install
# Configure .env (see backend/README.md)
bunx prisma db push
bun run dev
```

Backend runs at `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 3. WhatsApp Bot (Optional)

```bash
cd whatsapp-channel
npm install
npm start
```

Scan QR code to link WhatsApp. Bot runs HTTP server at `http://localhost:3002`

---

## Project Structure

```
PKG_TechBlitz26/
├── backend/              # Bun + TypeScript REST API
│   ├── prisma/           # Database schema
│   ├── src/
│   │   ├── modules/      # Feature modules (auth, doctors, patients, etc.)
│   │   ├── middleware/   # Auth + RBAC middleware
│   │   └── server.ts     # Entry point
│   └── README.md
├── frontend/             # React 19 + Vite SPA
│   ├── src/
│   │   ├── api/          # API client modules
│   │   ├── components/   # Dashboards + Auth + Registration
│   │   └── App.tsx       # Role-based routing
│   └── README.md
├── whatsapp-channel/     # WhatsApp bot + HTTP server
│   ├── src/
│   │   ├── bot.ts        # WhatsApp client + HTTP server
│   │   └── commands/     # Bot command handlers
│   └── README.md
└── README.md             # This file
```

---

## User Roles & Dashboards

### Patient
- **Registration:** Name, Age, Gender, Blood Group, Address, Medical History
- **Dashboard:** Next appointment card, upcoming/past appointments, book/cancel/reschedule
- **Profile:** Edit personal and medical information

### Doctor
- **Registration:** Name, Specialization, Qualifications, Experience, Consultation Fee, Bio
- **Dashboard:** Today's schedule, appointment list, KPI stats, profile card
- **Profile:** Edit professional details and bio

### Receptionist
- **Registration:** Name only
- **Dashboard:** All appointments table, search by doctor, filter by status
- **Profile:** Edit name

---

## API Documentation

See **[backend/README.md](backend/README.md)** for complete API reference.

**Key Endpoints:**
- `POST /auth/request-otp` — Request OTP (delivered via WhatsApp)
- `POST /auth/verify-otp` — Verify OTP, receive JWT
- `GET /doctors` — List all doctors
- `POST /appointments/book` — Book appointment with conflict detection
- `GET /dashboard/today` — Today's appointments and stats
- `GET /patients/profile` — Get patient profile
- `POST /patients/profile` — Create patient profile
- `GET /doctors/me` — Get logged-in doctor's profile
- `POST /doctors/me` — Create/update doctor profile

---

## Authentication Flow

1. User enters phone number on web app
2. Backend generates 6-digit OTP
3. OTP delivered via WhatsApp bot (HTTP call to `http://localhost:3002/send-message`)
4. User enters OTP on web app
5. Backend verifies OTP and issues JWT token
6. Token includes `{ userId, phone, role }` payload
7. Frontend stores token in `localStorage` under `clinico_token`
8. All authenticated requests include `Authorization: Bearer <token>` header

---

## License

MIT
