# Healthcare Frontend (React + Vite)

TypeScript frontend that targets the provided Kayan healthcare backend. It covers the three personas (patient, doctor, finance) with route-level guarding, axios-based token refresh, Tailwind styling + MUI components, react-hook-form + yup validation, and react-query for optimistic visit updates.

## Stack

- Vite + React 19 + React Compiler
- TypeScript + ESLint + Vitest + React Testing Library
- TailwindCSS for utilities and MUI for polished components
- axios instance with interceptors + react-query client
- react-hook-form + yup validation schemas mirroring backend DTOs

## Project structure

```
client/
  src/
    api/            # axios instance + domain services
    components/     # shared UI (Header, cards, forms)
    contexts/       # AuthProvider keeps tokens in memory
    hooks/          # auth + appointments + doctor directory
    pages/          # Login + role specific flows
    schemas/        # yup validation shared across pages
    types/          # API contracts
    utils/          # helpers (dates, constants, mock data)
```

## Getting started

1. Install dependencies
   ```bash
   npm ci
   ```
2. Configure environment variables
   ```bash
   cp .env.example .env
   # adjust VITE_API_URL (defaults to http://localhost:4000)
   ```
3. Run locally
   ```bash
   npm run dev
   ```
4. Production build / preview
   ```bash
   npm run build
   npm run preview
   ```

## Scripts

| Command        | Purpose                                   |
| -------------- | ----------------------------------------- |
| `npm run dev`  | Start Vite dev server with HMR            |
| `npm run lint` | ESLint across the project                 |
| `npm run test` | Vitest + React Testing Library            |
| `npm run build`| Type-check + production bundle            |
| `npm run preview` | Serve built assets locally             |

## Auth & tokens

- Login returns `user`, `accessToken`, `refreshToken`. The access token is stored in-memory, refresh token encrypted in `localStorage` as fallback (backend already issues httpOnly cookies if enabled).
- axios interceptors attach `Authorization` headers and automatically call `/auth/refresh` on 401.
- Role-based routing lives in `ProtectedRouteByRole`.

## Pages & flows

- **Login** (`/login`) – shared page, validated via yup, lists demo credentials from backend seeds (`patient@example.com` / `patient123`, `doctor@example.com` / `doctor123`, `finance@example.com` / `finance123`).
- **Patient**:
  - `/patient/doctors` – searchable doctor directory (combines finance search data + patient history, falls back to `src/utils/mockData.ts` if backend lacks a public doctor endpoint).
  - `/patient/appointments/new` – select doctor + datetime, validated > now. Posts to `/patients/:id/appointments`.
  - `/patient/appointments` – own appointments with statuses + totals.
- **Doctor**:
  - `/doctor/appointments` – assigned visits (today/upcoming). Buttons navigate to details.
  - `/doctor/appointment/:id` – start/finish visit, add treatments (optimistic UI, handles 409 conflicts). Treatment list + server-computed total are shown.
- **Finance**:
  - `/finance/search` – filters doctor/patient/appointment/date range with pagination, review modal to approve or add notes via `/finance/appointments/:id/review`.

## Styling

- Tailwind utilities are available via `src/index.css`.
- MUI handles layout primitives, tables, buttons. Customize tokens in `tailwind.config.js`.

## Tests

- `src/__tests__/LoginPage.test.tsx` – validates login form errors + submit payload.
- `src/__tests__/TreatmentForm.test.tsx` – ensures treatment form sends numeric payloads.
- Run with `npm run test`.

## CI/CD

- `.github/workflows/ci.yml` (see repo root) runs `npm ci`, `npm run lint`, `npm run test`, and `npm run build`.
- Deploy to Vercel: connect the repo, set env vars (`VITE_API_URL`, `VITE_APP_NAME`, `VITE_CORS_ORIGIN`), and point build command to `npm run build` with output `dist`.
- Netlify alternative: same env vars + `npm run build`.

## Curl examples

_Replace IDs with real UUIDs from your DB._

```bash
# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"patient123"}'

# Patient books an appointment
curl -X POST http://localhost:4000/patients/<patientId>/appointments \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"doctor_id":"<doctorId>","scheduled_time":"2025-01-01T09:00:00Z"}'

# Doctor starts visit and adds treatment
curl -X POST http://localhost:4000/appointments/<appointmentId>/start \
  -H "Authorization: Bearer <doctorAccessToken>"
curl -X POST http://localhost:4000/appointments/<appointmentId>/treatments \
  -H "Authorization: Bearer <doctorAccessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Blood test","cost":45}'

# Finance search & review
curl "http://localhost:4000/finance/appointments?doctor=smith&limit=10" \
  -H "Authorization: Bearer <financeAccessToken>"
curl -X POST http://localhost:4000/finance/appointments/<appointmentId>/review \
  -H "Authorization: Bearer <financeAccessToken>" \
  -H "Content-Type: application/json" \
  -d '{"approved":true,"notes":"Ready for payout"}'
```

## Deployment checklist

1. Set env vars on Vercel/Netlify.
2. Ensure backend sends `VITE_CORS_ORIGIN` to allow the deployed domain.
3. Enable HTTPS only (backend already checks `NODE_ENV` for secure cookies).
4. Update `src/utils/mockData.ts` with real doctor IDs if you want static fallback disabled.

## Notes

- Backend currently lacks a public doctor directory. The UI first tries secure endpoints (finance search → doctor list for finance role, patient appointment history for patient role). If none exist, fallback mock data is shown so the UX remains demonstrable; update `DEMO_DOCTORS` to map to real IDs.
- For consistent state, seed the backend DB using its provided scripts before running the frontend flows above.
