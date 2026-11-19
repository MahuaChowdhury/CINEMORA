# Netflix Clone — Angular 22 + PrimeNG + MEAN backend

Netflix-inspired streaming demo. Angular 22 frontend with PrimeNG (Aura preset, Netflix-red dark theme) and an Express + MongoDB backend with JWT auth and email OTP verification.

## Features

- **Auth with email OTP** — register → 6-digit OTP mailed via Gmail SMTP → verify → login (JWT, 7-day sessions)
- **Movie catalog API** — search, genre filter, featured/trending flags, admin-only CRUD
- **Watchlist ("My List")** — per-user saved titles
- **Frontend** — login/register/OTP pages, browse page (hero, trending row, genre chips, live search), movie detail with player, My List, Admin dashboard, header + drawer sidenav (PrimeNG)

## Requirements

- Node.js 20.19+ / 22.12+ / 24.x
- MongoDB running locally, or a MongoDB Atlas URI
- A Gmail address with 2-Step Verification and an App Password (for OTP emails)

## Backend setup

```bash
cd backend
npm install
```

1. Copy `.env.example` to `.env` and configure `MONGO_URI`, `JWT_SECRET`, `SMTP_EMAIL`, `SMTP_APP_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
2. Optionally seed demo movies + admin account:

   ```bash
   npm run seed
   ```

   (WARNING: wipes and recreates demo movies; use once on a throwaway database.)
3. Start the API:

   ```bash
   npm run dev
   ```

4. Health check: http://localhost:5000/api/health

## Frontend setup

```bash
npm install
npm start
```

Open http://localhost:4200

## OTP flow

Register → OTP emailed → Verify OTP → Login → My List. The OTP is bcrypt-hashed in MongoDB, valid for 5 minutes, with 5 verification attempts and a 60-second resend cooldown. The seeded admin account is pre-verified.

## Gmail SMTP

Enable 2-Step Verification on the Gmail account, create an App Password, and use it as `SMTP_APP_PASSWORD` (not your normal Gmail password). Never commit `.env` or share secrets.

## API overview

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/health` | GET | — | Health check |
| `/api/auth/register` | POST | — | Create account, sends OTP |
| `/api/auth/verify-otp` | POST | — | Verify 6-digit OTP |
| `/api/auth/resend-otp` | POST | — | Resend OTP (60 s cooldown) |
| `/api/auth/login` | POST | — | Login, returns JWT + user |
| `/api/auth/me` | GET | JWT | Current user |
| `/api/movies` | GET | — | List/search movies (`?search=`, `?genre=`) |
| `/api/movies/:id` | GET | — | Movie detail |
| `/api/movies` | POST | Admin | Create movie |
| `/api/movies/:id` | PUT/DELETE | Admin | Update/delete movie |
| `/api/watchlist` | GET | JWT | List saved movies |
| `/api/watchlist/:id` | POST/DELETE | JWT | Add/remove from watchlist |
