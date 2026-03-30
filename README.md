# Schedula — Smart Scheduling Platform

A production-ready scheduling platform built with **Next.js 14**, similar to Calendly. Users can register, set their availability, share a booking link, and have meetings automatically synced to Google Calendar.

## 🚀 Live Demo
**[schedula.vercel.app](https://schedula.vercel.app)** *(deploy to update)*

---

## ✨ Features

| Feature | Details |
|---|---|
| **Authentication** | Google OAuth + email/password via NextAuth.js |
| **Event Types** | Create multiple meeting types (15, 30, 60 min etc.) with custom colors |
| **Availability** | Set per-day working hours (Mon–Sun), toggle days on/off |
| **Booking page** | Public shareable URL: `/{username}/{event-slug}` |
| **Time zone support** | Auto-detects visitor timezone; all times stored in UTC |
| **Google Calendar sync** | Confirmed bookings appear on host's Google Calendar |
| **Email notifications** | Booking confirmation + cancellation emails via Resend |
| **AI assistant** | Natural language date picker (GPT-4o-mini) |
| **Responsive design** | Mobile-first, works on all screen sizes |

---

## 🛠 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API routes, server actions in one repo |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first, responsive by default |
| Auth | NextAuth.js v5 (Auth.js) | Google OAuth + credentials out of the box |
| ORM | Prisma | Type-safe DB access, easy migrations |
| Database | PostgreSQL (Neon) | Free tier, production-ready |
| Calendar | Google Calendar API | Widely used, sync bookings + check availability |
| Email | Resend | Modern transactional email, generous free tier |
| LLM | OpenAI GPT-4o-mini | Low cost, fast; natural language scheduling |
| Hosting | Vercel | Zero-config Next.js deploy, edge runtime |

---

## 🏗 Setup

### 1. Clone & install

```bash
git clone <repo>
cd schedula
npm install
```

### 2. Configure environment

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` — PostgreSQL connection string (get from [neon.tech](https://neon.tech))
- `NEXTAUTH_SECRET` — Random secret: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — From Google Cloud Console
- `RESEND_API_KEY` — From [resend.com](https://resend.com)
- `OPENAI_API_KEY` — From [platform.openai.com](https://platform.openai.com) *(optional)*

### 3. Database setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth + register
│   │   ├── bookings/     # Booking CRUD + cancel
│   │   ├── event-types/  # Event type CRUD
│   │   ├── availability/ # Weekly schedule
│   │   ├── slots/        # Available time slots
│   │   ├── profile/      # User profile
│   │   └── ai/suggest/   # AI date parser
│   ├── dashboard/        # Protected dashboard pages
│   ├── [username]/       # Public booking pages
│   ├── login/            # Auth pages
│   └── register/
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # DB client
│   ├── scheduling.ts     # Time slot engine
│   ├── google-calendar.ts# Google API helpers
│   ├── email.ts          # Transactional emails
│   └── utils.ts          # Shared utilities
└── middleware.ts          # Route protection
```

---

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Add your Vercel deployment URL as an authorized redirect URI in Google Cloud Console:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
5. Run Prisma migration on production:
   ```bash
   npx prisma migrate deploy
   ```

---

## 🤖 AI & Tools Used

- **Antigravity (Google DeepMind)** — AI coding assistant used to scaffold, write, and review the codebase
- **OpenAI GPT-4o-mini** — Powers the natural language scheduling assistant feature
- **Prisma AI** — Schema autocompletion
- **GitHub Copilot** — Minor autocomplete

---

## 📝 Assumptions & Decisions

1. **Single calendar page per event** — Simplest UX, aligned with Calendly's model
2. **UTC storage** — All times stored in UTC; converted to local timezone on display
3. **No payment** — Out of scope; easily addable with Stripe
4. **Token-based cancellation** — Cancel link uses a unique token, no auth required for guests
5. **Google Calendar is optional** — App works fully without it; calendar sync is a bonus
6. **SQLite not used** — PostgreSQL chosen for production readiness from day one
