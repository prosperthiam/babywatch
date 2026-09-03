# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

BabyWatch is a babysitting marketplace (French-language product, "la garde d'enfants en toute confiance") connecting parents ("parent" role) with sitters ("sitter" role). It ships as a web app (Vite/React) plus native Android/iOS wrappers via Capacitor, backed by an Express/PostgreSQL API.

## Commands

### Frontend (`frontend/`)
- `npm run dev` — start Vite dev server
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview a production build
- `npm run lint` — run oxlint (config in `.oxlintrc.json`)
- There is no test suite in this repo currently.

### Backend (`backend/`)
- `npm run dev` — start with nodemon (auto-restart)
- `npm start` — start with node
- Requires a `.env` with `PORT`, `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `FRONTEND_URL`.
- Schema lives in `database.sql` at the repo root (raw SQL, no migration tool — apply manually against the Postgres instance).

### Mobile (Capacitor, under `frontend/`)
- `npx cap sync` — sync web build into `android/` and `ios/` native projects after a frontend build
- Android project: `frontend/android` (Gradle). iOS project: `frontend/ios` (Xcode).

## Architecture

### Frontend is a single-file React app
Nearly the entire UI lives in `frontend/src/App.jsx` (~3300 lines). There is no router library in use (react-router-dom is a dependency but not wired up) — navigation is done via a `page` state string set through an `onNav` callback, plus manual `window.location.pathname`/`search` checks for a few special routes (`/confirm` email confirmation, `/reset-password`). Screens/components (Nav, ParentHome, SitterHome, BookingForm, AdminDashboard, ChatModal, PaymentModal, CameraPage, MapView, etc.) are all defined top-to-bottom in this one file, followed by the `App()` root component at the bottom that owns top-level state (`user`, `bookings`, `page`, `lang`) and session restoration from `localStorage` (`token`, `user`).

When adding a new screen, follow the existing pattern: a new top-level component in `App.jsx` taking `t` (translation function) and relevant callbacks as props, wired into `App()`'s page-switch logic — don't introduce react-router without discussing it first, since the whole app assumes string-based paging.

The API base URL is hardcoded at the top of `App.jsx` (`const API = 'https://babywatch-production.up.railway.app/api'`) rather than sourced from an env var — update it there if pointing at a different backend.

### i18n
`frontend/src/translations.js` exports a `translations` object keyed by language (`fr`/other) and a `useTranslation(lang)` hook returning a `t(key)` function. Language preference is persisted to `localStorage` under `lang`. Most components accept `t` as a prop with a `(k) => k` fallback default. New user-facing strings should be added as keys here rather than hardcoded, matching the existing components' pattern.

### Backend is a flat Express route-per-resource API
`backend/server.js` mounts one router per resource under `/api/*` (`auth`, `bookings`, `profile`, `reviews`, `admin`, `payments`, `notifications`, `favorites`, `chat`, `availability`, `children`). Each route file in `backend/routes/` independently creates its own `pg.Pool` and defines its own local `auth` middleware that reads a `Bearer` JWT from `Authorization`, verifies it with `JWT_SECRET`, and attaches `req.userId`/`req.userRole` — there is no shared middleware/db module, so new protected routes should copy this same inline pattern rather than trying to import a shared one.

`server.js` also sets up a `socket.io` server for real-time chat (rooms keyed `booking_${bookingId}`) and a daily 9am reminder job (`services/reminders.js`, scheduled via `setTimeout`/`setInterval` in `server.js`, not a cron library).

Business domain (see `database.sql`): `users` (role: parent/sitter/admin), `sitter_profiles`, `bookings` (status lifecycle, price, camera flag), `camera_sessions` (LiveKit-backed camera streaming during a booking), `messages` (chat), plus supporting tables for children profiles, availability, favorites, notifications, and email confirmation tokens.

### Payments & live camera
Stripe (`stripe` / `@stripe/stripe-js`) handles payments (`routes/payments.js`, `PaymentModal` in the frontend). LiveKit (`livekit-client`, `@livekit/components-react`) backs the in-booking camera feature (`CameraPage` in the frontend, `camera_sessions` table).

### Email
`backend/Services/email.js` uses Resend for transactional email (registration confirmation, booking notifications, password reset). Note the directory is `Services/` (capital S) while `server.js`/route files `require('./services/...')` — this only works on case-insensitive filesystems (Windows/default macOS); be aware of this if ever deploying from or to a case-sensitive filesystem.
