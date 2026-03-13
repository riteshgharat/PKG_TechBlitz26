# 🏥 Clinico Frontend

React 19 single-page application with **role-based dashboards** and **multi-step registration**.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with latest features |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **Lucide React** | Icon library |
| **CSS-in-JS** | Inline styles with design system |

---

## Features

### Authentication
- **Phone-based OTP login** — No passwords required
- **JWT token management** — Stored in `localStorage` as `clinico_token`
- **Role detection** — Decoded from JWT payload (`patient`, `doctor`, `receptionist`)
- **Auto-login** — Persists session across page refreshes

### Role-Based Routing

The app shows different interfaces based on user role:

| Role | Registration | Dashboard |
|------|--------------|-----------|
| **Patient** | 3-step form (Personal → Location → Medical) | Appointments, booking, profile |
| **Doctor** | 3-step form (Personal → Professional → Bio) | Today's schedule, KPIs, profile |
| **Receptionist** | Single-step (name only) | All appointments, search/filter |

### Patient Dashboard
- **Next Appointment Card** — Shows upcoming appointment with doctor details
- **Appointment History** — Filter by all/completed/cancelled
- **Book Appointment** — 4-step modal (doctor → date → slot → confirm)
- **Reschedule/Cancel** — Manage existing appointments
- **Navbar Logout Button** — Dedicated "Sign Out" button in top-right navbar
- **Profile Edit** — Update name, age, gender, blood group, address, medical history via Settings icon
- **Delete Account** — Danger zone at the bottom of the profile modal with inline confirmation

### Doctor Dashboard
- **Today's Schedule** — List of today's appointments with timestamps
- **KPI Cards** — Today's appointments, completed, pending, total visits
- **Profile Card** — Quick view of specialization, experience, fee
- **Navbar Logout Button** — Dedicated "Sign Out" button; avatar click opens profile modal
- **Profile Edit** — Update name, specialization, qualifications, experience, fee, bio
- **Delete Account** — Danger zone at the bottom of the profile modal with inline confirmation

### Receptionist Dashboard
- **All Appointments Table** — Comprehensive view with patient, doctor, time, status
- **Search & Filter** — Search by doctor name, filter by status
- **KPI Cards** — Total today, completed, upcoming, cancelled
- **Navbar Logout Button** — Dedicated "Sign Out" button; avatar click opens profile modal
- **Profile Edit** — Update name
- **Delete Account** — Danger zone at the bottom of the profile modal with inline confirmation
- **KPI Cards** — Total today, completed, upcoming, cancelled
- **Profile Edit** — Update name

---

## Prerequisites

- **Node.js** v20+ or **Bun** v1.0+
- Backend running at `http://localhost:3001`

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### 4. Preview Production Build

```bash
npm run preview
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                       # API client modules
│   │   ├── client.ts              # Base fetch wrapper + JWT management
│   │   ├── auth.ts                # OTP request/verify
│   │   ├── users.ts               # User profile endpoints
│   │   ├── patients.ts            # Patient profile CRUD
│   │   ├── doctors.ts             # Doctor listing + profile CRUD
│   │   ├── appointments.ts        # Booking, cancel, reschedule
│   │   └── dashboard.ts           # Today's appointments & stats
│   ├── components/
│   │   ├── SplashScreen.tsx       # Loading screen
│   │   ├── AuthPage.tsx           # Phone + OTP login (2-step)
│   │   ├── PatientRegistration.tsx    # 3-step patient onboarding
│   │   ├── DoctorRegistration.tsx     # 3-step doctor onboarding
│   │   ├── ReceptionRegistration.tsx  # 1-step receptionist onboarding
│   │   ├── PatientDashboard.tsx       # Patient main interface
│   │   ├── DoctorDashboard.tsx        # Doctor main interface
│   │   └── ReceptionDashboard.tsx     # Receptionist main interface
│   ├── assets/
│   │   ├── Clinico-removebg-preview.png   # Logo
│   │   └── hero.png                       # Hero image
│   ├── App.tsx                    # Main router (role-based)
│   ├── App.css                    # Global styles
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Reset & base styles
├── public/
│   └── favicon.svg
├── vite.config.ts                 # Vite config with proxy
├── package.json
└── tsconfig.json
```

---

## API Integration

### Proxy Configuration

`vite.config.ts` proxies `/api/*` to backend:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

**Usage:** All API calls use `/api` prefix, automatically forwarded to backend.

### API Client (`api/client.ts`)

Base `request()` function handles:
- JWT token attachment (`Authorization: Bearer <token>`)
- Response envelope unwrapping (backend wraps as `{ success, data }`)
- Error handling
- Token storage in `localStorage` under `clinico_token`

**Important:** Backend responses are wrapped as:
```json
{
  "success": true,
  "data": { /* actual response */ }
}
```

The client automatically unwraps `json.data` before returning.

### Role Detection

JWT payload structure:
```json
{
  "userId": "uuid",
  "phone": "9876543210",
  "role": "PATIENT" | "doctor" | "receptionist",
  "iat": 1234567890,
  "exp": 1234567890
}
```

`getRoleFromToken()` decodes JWT (without verification) to extract role:
```ts
export function getRoleFromToken(): 'patient' | 'doctor' | 'receptionist' {
  const token = getToken();
  if (!token) return 'patient';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role?.toLowerCase() || 'patient';
  } catch {
    return 'patient';
  }
}
```

---

## Styling Approach

### Design System

The app uses inline CSS-in-JSX with a consistent design system:

**Colors:**
- Primary: `#4f46e5` (Indigo)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Red)
- Gray scale: `#f9fafb` → `#1f2937`

**Typography:**
- Headers: `Plus Jakarta Sans` (Google Fonts)
- Body: `Outfit` (Google Fonts)

**Components:**
- Cards: White background, subtle shadow, rounded corners
- Buttons: Solid primary color, hover effects
- Modals: Overlay + centered card with backdrop blur
- Forms: Labeled inputs with focus states

### CSS Organization

Each component includes its own `<style>` block with scoped class names:
- `.modal-overlay`, `.modal-card` — Modal system
- `.btn-primary`, `.btn-secondary` — Button styles
- `.form-input`, `.form-label` — Form components
- `.kpi-card`, `.appointment-card` — Dashboard widgets

---

## Authentication Flow

1. User lands on app
2. Check `localStorage.clinico_token`:
   - **No token** → Show `AuthPage`
   - **Has token** → Decode role, skip registration (`isNewUser: false`)
3. User enters phone number → `POST /api/auth/request-otp`
4. User enters OTP → `POST /api/auth/verify-otp`
   - Response: `{ token, user, isNewUser }`
5. Store token in `localStorage`
6. If `isNewUser === true` → Show registration form for role
7. After registration → Show dashboard for role

### Registration Logic

**Patient Registration:**
- Step 1: Name, Age, Gender
- Step 2: Address
- Step 3: Blood Group, Medical History
- Calls: `POST /api/patients/profile` + `PATCH /api/users/profile`

**Doctor Registration:**
- Step 1: Name, Specialization
- Step 2: Qualifications, Experience, Consultation Fee
- Step 3: Bio
- Calls: `POST /api/doctors/me` + `PATCH /api/users/profile`

**Receptionist Registration:**
- Single step: Name
- Calls: `PATCH /api/users/profile`

---

## Key Components

### `App.tsx` — Main Router

Handles role-based routing:
```tsx
if (!hasToken) return <AuthPage onLogin={handleLogin} />
if (userMeta.isNewUser) {
  if (userMeta.role === 'doctor') return <DoctorRegistration ... />
  if (userMeta.role === 'receptionist') return <ReceptionRegistration ... />
  return <PatientRegistration ... />
}
if (userMeta.role === 'doctor') return <DoctorDashboard ... />
if (userMeta.role === 'receptionist') return <ReceptionDashboard ... />
return <PatientDashboard ... />
```

### `AuthPage.tsx` — Login

2-step OTP flow:
1. Phone input → Request OTP
2. OTP input → Verify OTP

On success, calls `onLogin({ role, isNewUser })` prop.

### Dashboard Components

All dashboards follow similar structure:
- **Navbar:** Logo, date/time, notifications, avatar (logout dropdown)
- **KPI Row:** 4 stat cards
- **Main Content:** Role-specific widgets
- **Profile Modal:** Edit profile fields

---

## TypeScript Configuration

- **React 19** types included
- **Strict mode** enabled
- **Path aliases** not configured (relative imports)
- **Target:** ES2020
- **Module:** ESNext

---

## Environment Variables

Not used. Backend URL is hardcoded in `vite.config.ts` proxy.

To change backend URL, edit `vite.config.ts`:
```ts
proxy: {
  '/api': {
    target: 'http://your-backend-url:3001',
    // ...
  }
}
```

---

## Browser Support

- **Chrome/Edge:** ✅ Latest
- **Firefox:** ✅ Latest
- **Safari:** ✅ Latest
- **Mobile:** ✅ iOS Safari, Chrome Android

---

## Known Issues

- No React Router — manual routing in `App.tsx`
- No global state management — local state only
- No form validation library — manual validation
- No date picker — native `<input type="date">`
- No loading skeletons — simple "Loading..." text

---

## License

MIT
