# Logbook — Personal Productivity Dashboard

A Next.js 14 App Router dashboard for tasks and notes, persisted to Neon
Postgres and built to deploy on Vercel. Server Actions handle all writes
(no separate API layer needed), and the Neon serverless driver talks to
the database over HTTP, so it works cleanly in Vercel's serverless
functions.

## What's inside

- **Today** (`/`) — a stat strip, a 24-hour "watch" rail plotting today's
  timed tasks, and a focus list of anything overdue, due today, or high
  priority.
- **Tasks** (`/tasks`) — full CRUD: create with title/priority/due
  date/notes, toggle done, delete.
- **Notes** (`/notes`) — quick capture with pin/unpin and delete.
- `GET /api/health` — confirms the app can reach the database (useful
  right after deploying).

## 1. Create the database (Neon)

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. Open **Connection Details** and copy the **pooled** connection string
   (it looks like `postgresql://user:pass@ep-xxxx-pooler.../neondb?sslmode=require`).
3. Paste it into `.env.local`:

   ```bash
   cp .env.example .env.local
   # then edit .env.local and set DATABASE_URL
   ```

4. Apply the schema (creates the `tasks` and `notes` tables):

   ```bash
   npm install
   npm run db:init
   ```

   Alternatively, open the Neon SQL editor in the dashboard and paste in
   the contents of `lib/schema.sql` directly.

## 2. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 3. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, click **New Project** and import the repo (Vercel
   auto-detects Next.js — no build config needed).
3. Under **Environment Variables**, add `DATABASE_URL` with the same
   Neon connection string, then deploy.
4. After the first deploy, visit `https://your-app.vercel.app/api/health`
   to confirm the database connection is working. If you haven't run
   `npm run db:init` yet, run it locally against the same `DATABASE_URL`
   (or run `lib/schema.sql` in the Neon SQL editor) before using the app.

Optional: Vercel's Neon integration (in the Vercel Marketplace) can
provision the database and set `DATABASE_URL` for you automatically —
either approach works, since the app only needs that one environment
variable.

## Project structure

```
app/
  page.tsx            Today dashboard
  tasks/page.tsx       Tasks list + form
  notes/page.tsx       Notes list + form
  api/health/route.ts   DB connectivity check
components/            UI pieces (Sidebar, DayRail, forms, list items)
lib/
  db.ts                Neon client + shared types
  actions.ts            Server Actions (create/toggle/delete)
  schema.sql            Table definitions
scripts/init-db.mjs      Applies schema.sql to DATABASE_URL
```

## Extending it

- **More tables**: add to `lib/schema.sql`, re-run `npm run db:init`,
  add types to `lib/db.ts`, and add Server Actions in `lib/actions.ts`.
- **Auth**: there's none yet — this is single-user by design. If you
  want multiple users, add an `auth` provider (e.g. Auth.js) and a
  `user_id` column on `tasks`/`notes`, and filter every query by the
  signed-in user.
- **Habits / calendar / other widgets**: follow the same pattern —
  a table in `schema.sql`, a Server Action, and a component that
  fetches with `sql` in a server component page.
