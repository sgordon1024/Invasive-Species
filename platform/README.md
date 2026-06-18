# Invasive Ops

Liquor sales & inventory tracking for Invasive Species Brewing & Distillery — a
lightweight, self-hosted alternative to Ekos, starting with the sales + inventory
modules.

Standalone Vite + React app. Lives in `platform/` inside the main repo but builds
and deploys independently from the public marketing site.

## Features (v1)

- **Dashboard** — 30-day revenue, sales count, low-stock count, a 7-day revenue
  chart, top sellers, and a restock list.
- **Sales** — record sales with multiple line items; each sale automatically
  decrements inventory (atomic, via a Postgres function).
- **Inventory** — live on-hand levels with low/out-of-stock flags; receive stock,
  log waste, or make manual corrections.
- **Products** — manage the spirits catalog: price, cost, size, proof, reorder point.
- **Auth** — Supabase email/password login; only signed-in team members can access.

## Stack

- React 19 + Vite (matches the main site)
- React Router 7
- Supabase (Postgres + Auth) — all tables prefixed `ops_`

## Setup

1. **Install**
   ```bash
   cd platform
   npm install
   ```

2. **Configure** — copy `.env.example` to `.env.local` and fill in your Supabase
   URL + anon key (can be the same project as the main site, or a new one).

3. **Create the database tables** — open the Supabase dashboard → SQL Editor,
   paste the contents of [`schema.sql`](./schema.sql), and run it. This creates the
   `ops_*` tables, the on-hand view, the atomic sale function, RLS policies, and
   seeds the current spirits lineup.

4. **Create team logins** — Supabase dashboard → Authentication → Users → Add user.
   (Public sign-up is intentionally not exposed in the app.) For an internal tool,
   also turn off public sign-ups under Authentication → Providers → Email.

5. **Run**
   ```bash
   npm run dev      # http://localhost:5180
   ```

## Deploy

Deploy as its own Vercel project with **Root Directory** set to `platform/`. Add
the two `VITE_SUPABASE_*` env vars in the Vercel project settings. Keep it behind
login (and ideally restrict sign-ups) since it's internal-only.

## Roadmap ideas

- Sale detail view + edit/void
- CSV export of sales & inventory
- Production / batch tracking (next Ekos module)
- Barrel aging + TTB proof-gallon reporting (distillery compliance)
- Per-user roles (admin vs. staff)
