# 🏥 TechBlitz Clinic Scheduling Backend

REST API backend for a doctor's clinic scheduling system built with **Bun**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## Tech Stack

| Tool                  | Purpose                              |
| --------------------- | ------------------------------------ |
| [Bun](https://bun.sh) | JavaScript runtime & package manager |
| TypeScript            | Type-safe development                |
| PostgreSQL            | Database                             |
| Prisma                | ORM & schema management              |
| Zod                   | Request validation                   |
| JSON Web Tokens       | Authentication                       |

---

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- [PostgreSQL](https://www.postgresql.org/) 14+

---

## Getting Started

### 1. Install Dependencies

```bash
cd backend
bun install
```

### 2. Configure Environment

Copy `.env.example` or create `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/clinic_os"

# JWT
JWT_SECRET="your-secret-key-at-least-16-chars"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
OTP_EXPIRY_MINUTES=5
NODE_ENV="development"

# WhatsApp Integration
WHATSAPP_SERVICE_URL="http://localhost:3002"
```

### 3. Set Up Database

Push the Prisma schema to your PostgreSQL database:

```bash
bunx prisma db push
```

Generate the Prisma client:

```bash
bunx prisma generate
```

### 4. Start the Server

```bash
bun run dev
```

Server starts at `http://localhost:3001`

---

## Available Scripts

| Command                | Description                       |
| ---------------------- | --------------------------------- |
| `bun run dev`          | Start dev server with auto-reload |
| `bun run start`        | Start production server           |
| `bunx prisma db push`  | Sync schema to database           |
| `bunx prisma generate` | Regenerate Prisma client          |
| `bunx prisma studio`   | Open Prisma Studio (DB GUI)       |

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma             # Database schema (6 tables)
├── src/
│   ├── server.ts                 # Entry point — Bun.serve()
│   ├── app.ts                    # Router, middleware chain, CORS
│   ├── config/
│   │   ├── env.ts                # Zod-validated environment variables
│   │   └── db.ts                 # Prisma client singleton
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types
│   ├── utils/
│   │   ├── logger.ts             # Colored console logger
│   │   ├── time.utils.ts         # Date/time helpers for slot generation
│   │   └── phone.utils.ts        # Phone number normalization
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   └── role.middleware.ts    # Role-based access control
│   └── modules/
│       ├── auth/                 # OTP request & verify, JWT issuance
│       ├── users/                # User profile management
│       ├── doctors/              # Doctor listing & details
│       ├── patients/             # Patient profiles
│       ├── schedule/             # Doctor weekly schedule CRUD
│       ├── appointments/         # Booking, cancel, reschedule, slots
│       │   ├── scheduling.engine.ts  # Clash detection logic
│       │   └── slot.generator.ts     # Available slot generation
│       └── dashboard/            # Today's appointment summary
├── .env                          # Environment variables
├── package.json
└── tsconfig.json
```

---

## API Endpoints

### Auth (No token required)

| Method | Endpoint            | Description                      |
| ------ | ------------------- | -------------------------------- |
| `POST` | `/auth/request-otp` | Send OTP to phone number         |
| `POST` | `/auth/verify-otp`  | Verify OTP and receive JWT token |

### Doctors

| Method  | Endpoint                | Auth | Description                        |
| ------- | ----------------------- | ---- | ---------------------------------- |
| `GET`   | `/doctors`              | No   | List all doctors                   |
| `GET`   | `/doctors/me`           | Yes  | Get current doctor's profile       |
| `POST`  | `/doctors/me`           | Yes  | Create doctor profile              |
| `PATCH` | `/doctors/me`           | Yes  | Update doctor profile              |
| `GET`   | `/doctors/:id`          | No   | Get doctor details by ID           |
| `GET`   | `/doctors/:id/schedule` | No   | Get doctor's weekly schedule       |

### Appointments

| Method  | Endpoint                              | Auth | Description               |
| ------- | ------------------------------------- | ---- | ------------------------- |
| `GET`   | `/appointments/slots?doctorId=&date=` | No   | Get available time slots  |
| `POST`  | `/appointments/book`                  | Yes  | Book an appointment       |
| `PATCH` | `/appointments/cancel`                | Yes  | Cancel an appointment     |
| `PATCH` | `/appointments/reschedule`            | Yes  | Reschedule an appointment |

### Schedules

| Method   | Endpoint               | Auth         | Description                |
| -------- | ---------------------- | ------------ | -------------------------- |
| `GET`    | `/schedules?doctorId=` | No           | Get schedules for a doctor |
| `POST`   | `/schedules`           | Doctor/Admin | Create a schedule entry    |
| `PATCH`  | `/schedules/:id`       | Doctor/Admin | Update a schedule          |
| `DELETE` | `/schedules/:id`       | Doctor/Admin | Delete a schedule          |

### Dashboard

| Method | Endpoint           | Auth | Description                  |
| ------ | ------------------ | ---- | ---------------------------- |
| `GET`  | `/dashboard/today` | Yes  | Today's appointments & stats |

### Users & Patients

| Method   | Endpoint            | Auth | Description                    |
| -------- | ------------------- | ---- | ------------------------------ |
| `GET`    | `/users/profile`    | Yes  | Get current user profile       |
| `PATCH`  | `/users/profile`    | Yes  | Update user name               |
| `DELETE` | `/users/me`         | Yes  | Delete account + all data      |
| `GET`    | `/patients`         | No   | List all patients              |
| `GET`    | `/patients/profile` | Yes  | Get patient profile (by phone) |
| `POST`   | `/patients/profile` | Yes  | Create patient profile         |
| `PATCH`  | `/patients/profile` | Yes  | Update patient profile         |

### Health

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| `GET`  | `/health` | Server health check |

---

## Appointment Clash Detection

Bookings are validated with the following rule to prevent double-booking:

```
Conflict exists when:
  existing.start_time < new_end_time
  AND
  existing.end_time > new_start_time
```

This applies to both **booking** and **rescheduling**. Cancelled appointments are excluded from conflict checks.

If a conflict is detected, the API returns:

```json
{
  "success": false,
  "error": "Time slot conflicts with an existing appointment. Please choose a different time."
}
```

**HTTP Status:** `409 Conflict`

---

## Authentication Flow

1. **Request OTP** → `POST /auth/request-otp` with `{ "phone": "9876543210" }`
   - Backend generates 6-digit OTP
   - OTP is sent to WhatsApp via HTTP call to `WHATSAPP_SERVICE_URL/send-message`
   - In development mode, the OTP is also logged to console
2. **Verify OTP** → `POST /auth/verify-otp` with `{ "phone": "9876543210", "otp": "123456" }`
   - Returns: `{ token, user: { id, phone, name, role }, isNewUser: boolean }`
   - `isNewUser` is `true` if `user.name === normalizedPhone` (default name on first login)
3. **Use Token** → Include in header: `Authorization: Bearer <token>`
   - JWT payload contains: `{ userId, phone, role }`

## WhatsApp Integration

The backend integrates with the WhatsApp bot service for OTP delivery.

When a user requests an OTP:
1. Backend generates OTP and stores it in `otp_verifications` table
2. Backend makes HTTP POST to `${WHATSAPP_SERVICE_URL}/send-message`:
   ```json
   {
     "to": "919876543210@s.whatsapp.net",
     "message": "🏥 Your Clinico OTP is: 123456\n\nValid for 5 minutes."
   }
   ```
3. WhatsApp bot sends the message via WhatsApp Web

**Note:** If `WHATSAPP_SERVICE_URL` is not configured or the service is down, OTPs are only logged to console.

---

## Database Tables

| Table               | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `users`             | User accounts (phone, name, role)                        |
| `doctors`           | Doctor profiles (name, phone, specialization, qualifications, experience, consultation_fee, bio) |
| `patients`          | Patient profiles (name, phone, age, gender, blood_group, address, medical_history, language) |
| `doctor_schedule`   | Weekly availability (day, start/end time, slot duration) |
| `appointments`      | Booked appointments (doctor, patient, time, status)      |
| `otp_verifications` | OTP codes for phone verification                         |

**Appointment statuses:** `booked`, `cancelled`, `completed`, `rescheduled`

**User roles:** `doctor`, `receptionist`, `PATIENT` (default)

---

## Postman Collection

Import `clinic_scheduling_api.postman_collection.json` into Postman to test all endpoints.

The collection auto-chains variables — run requests in order and IDs/tokens are captured automatically:

1. Request OTP → Verify OTP (saves token)
2. Get All Doctors (saves doctorId)
3. Get All Patients (saves patientId)
4. Book → Cancel → Reschedule (saves appointmentId)

---

## License

MIT
