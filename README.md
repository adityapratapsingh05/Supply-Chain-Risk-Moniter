# Meridian — Real-Time Supply Chain Risk Monitor

A production-grade SaaS for monitoring supplier risk, generating AI mitigation plans, and visualizing
global disruption exposure.

```
supply-chain-monitor/
├── backend/     Express + TypeScript + Prisma API
└── frontend/    Next.js 15 + TypeScript + Tailwind app
```

## Stack

- **Frontend:** Next.js 15, React, TypeScript, TailwindCSS, React Query, Recharts, Framer Motion
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT + bcrypt, Google OAuth, email verification, forgot/reset password, role-based access (Admin/Manager/Viewer)
- **AI:** Anthropic Claude API (mitigation plans, news classification, disruption simulation, executive briefs)
- **Storage:** Cloudinary (avatars/attachments)
- **Deployment:** Vercel (frontend) · Render (backend) · Supabase (Postgres)

## 1. Local setup

### Database (Supabase)
1. Create a project at https://supabase.com.
2. Go to **Project Settings → Database → Connection string** and copy the **URI** (pooled, port 6543) into
   `DATABASE_URL`, and the direct connection (port 5432) into `DIRECT_URL`.

### Backend
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma migrate dev --name init
npm run seed               # creates demo users + sample suppliers
npm run dev                 # http://localhost:8080
```

Demo logins after seeding:
| Email | Password | Role |
|---|---|---|
| admin@samsung.com | Admin@2026 | ADMIN |
| analyst@samsung.com | Samsung@2026 | MANAGER |
| cpo@samsung.com | Exec@2026 | VIEWER |

### Frontend
```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev                   # http://localhost:3000
```

## 2. Google OAuth setup
1. Go to https://console.cloud.google.com/apis/credentials.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add authorized JavaScript origin: your frontend URL (e.g. `https://your-app.vercel.app`).
4. Add authorized redirect URI: `https://your-backend.onrender.com/api/auth/google/callback`.
5. Copy Client ID → `GOOGLE_CLIENT_ID` in both backend `.env` and frontend `.env.local`
   (as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`). Copy Client Secret → backend `GOOGLE_CLIENT_SECRET`.

## 3. Email (SMTP)
Any SMTP provider works (Gmail app password, Resend, SendGrid, Postmark). Fill `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` in the backend `.env`. Without these set, emails are logged to the
console instead of sent — useful for local dev.

## 4. Deploying

### Database — Supabase
Already provisioned in step 1. Run `npx prisma migrate deploy` (done automatically by `render.yaml`'s
start command) to apply schema to production.

### Backend — Render
1. Push this repo to GitHub.
2. In Render, **New → Blueprint**, point at the repo — it will read `backend/render.yaml`.
3. Fill in the secret env vars flagged `sync: false` in the Render dashboard (DATABASE_URL, DIRECT_URL,
   CLIENT_URL, GOOGLE_CLIENT_ID/SECRET, SMTP_*, CLOUDINARY_*, ANTHROPIC_API_KEY, NEWSAPI_KEY).
4. Deploy. Render gives you a URL like `https://supply-chain-monitor-api.onrender.com` — this is your
   **Backend URL**.

### Frontend — Vercel
1. Import the repo in Vercel, set **root directory** to `frontend`.
2. Add env var `NEXT_PUBLIC_API_URL` = your Render backend URL.
3. Deploy. Vercel gives you a URL like `https://meridian-risk.vercel.app` — this is your **Frontend URL**
   and your **Live URL**.
4. Go back to the backend's `CLIENT_URL` env var on Render and set it to this Vercel URL (needed for CORS
   and for email links), then redeploy the backend.

### Required environment variables — quick reference

**Backend (Render):**
`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `ANTHROPIC_API_KEY`, `NEWSAPI_KEY`

**Frontend (Vercel):**
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## 5. What's included vs. what needs your own credentials

Everything in this repo is real, working code — auth, database schema, CRUD, CSV/Excel import-export,
AI endpoints, dashboards, admin panel, security middleware (helmet, rate limiting, CORS, bcrypt, JWT).

What you must supply yourself (these can't be generated for you):
- A Supabase project + connection string
- A Google Cloud OAuth client
- An SMTP provider (or Gmail app password)
- A Cloudinary account
- An Anthropic API key (for the AI recommendation engine)
- A NewsAPI.org key (for hourly news ingestion)
- Actually clicking "Deploy" on Vercel/Render, since these require your own accounts

## 6. Testing
```bash
cd backend && npm test
```
