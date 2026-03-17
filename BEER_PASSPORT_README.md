# Beer Passport — Invasive Species Brewing

A lightweight, web-based loyalty system that rewards regulars for showing up.

---

## How It Works

**For customers:**

1. Sign up at `/passport` with first name + email (takes 60 seconds)
2. Visit the taproom and scan the QR code posted at the bar
3. Hit visit milestones to earn rewards; show their passport to a bartender to redeem

**For staff:**

1. Log in at `/passport/login` with a staff account
2. Navigate to `/staff` to access the Staff Portal
3. Each shift: click "Generate QR Code" to get today's check-in QR
4. Display or print the QR code — post it visibly in the taproom
5. When a customer wants to redeem a reward: look them up by email/phone/member ID and click "Redeem"

---

## Reward Milestones (default)

| Visits | Reward              | Description                                     |
|--------|---------------------|-------------------------------------------------|
| 5      | Frequent Flyer      | Free pint on your next visit                    |
| 10     | Local Legend        | 10% off your tab                                |
| 20     | Invasive Regular    | Free flight of 5 + name on the Wall of Fame     |

**To change rewards:** Edit the `rewards` table in your Supabase dashboard (Table Editor). Change `visit_threshold`, `name`, or `description`. Changes take effect immediately — no code deploy needed.

---

## Fraud Prevention

The system is designed to stop casual abuse without being paranoid.

**How a valid check-in works:**

1. Customer is logged in (Supabase auth JWT required)
2. The QR code token is valid and not expired (checked server-side)
3. Customer has not already checked in today (calendar day, Eastern time)
4. The IP address hasn't exceeded 30 check-in attempts per hour
5. The user account hasn't exceeded 10 attempts per hour

**What gets logged to `audit_logs`:**
- `signup` — every new account creation
- `checkin_attempt` — every scan, valid or not
- `checkin_success` — successful verified visit
- `checkin_blocked` — blocked attempt with reason
- `reward_redeemed` — staff redemption
- `token_generated` — whenever staff rotates the QR

**Why it's hard to cheat:**
- Visit counts are stored server-side and never trusted from the client
- The QR token is a cryptographically random 64-char hex string — not guessable
- Tokens expire after 20 hours by default (rotated daily by staff)
- A saved screenshot of a QR code stops working when the token rotates
- Rewards can only be redeemed by staff — customers cannot self-redeem
- The same reward cannot be redeemed twice (database constraint)

**What it doesn't do:** GPS geofencing, device fingerprinting, or multi-account detection — those add significant complexity for marginal security gain at a small taproom. The QR rotation is the primary guard.

---

## Daily Staff Workflow

| Task | How |
|------|-----|
| Generate today's QR | Log in → `/staff` → click "Generate QR Code" |
| Display the QR | Print it, show it on a tablet, or tape it to the bar |
| Redeem a reward | Search member by email/phone → click "Redeem" next to the earned reward |
| Rotate the QR mid-shift | Click "Rotate Token" — this immediately invalidates the old one |

**Time required per day:** ~2 minutes (just generate + display the QR).

---

## Rotating the QR Code Token

The QR code token should be rotated at minimum once per day.

**Manual rotation (recommended):**
- Open the Staff Portal → click "Rotate Token"
- A new QR image appears immediately
- The old token is invalidated server-side within seconds

**When to rotate:**
- Start of every business day
- If you suspect someone has screenshot and shared the current QR
- After any security concern

**The check-in URL format:**
```
https://invasivespeciesbrewing.com/Invasive-Species/checkin?token=<64-char-hex>
```

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **Settings → API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key (keep secret) → used in Edge Function secrets

### 2. Run the Database Migration

In your Supabase project:
1. Open **SQL Editor**
2. Paste the contents of `supabase/migrations/001_beer_passport.sql`
3. Click **Run**

This creates all tables, RLS policies, and seeds the default rewards.

### 3. Deploy the Edge Functions

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Log in
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets for edge functions
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set SITE_URL=https://invasivespeciesbrewing.com/Invasive-Species

# Deploy all three functions
supabase functions deploy checkin
supabase functions deploy generate-token
supabase functions deploy redeem-reward
```

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 5. Create a Staff Account

1. Go to Supabase Dashboard → **Authentication → Users** → Invite user
2. Use `staff@invasivespeciesbrewing.com` (or any email)
3. After they confirm their email, run this in the SQL editor:

```sql
-- Replace with the actual auth user ID from the Authentication tab
UPDATE passport_members
SET is_staff = TRUE
WHERE email = 'staff@invasivespeciesbrewing.com';
```

> Note: The staff member must sign up through `/passport/login` first so a `passport_members` row exists.

### 6. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173/Invasive-Species/passport` to see the landing page.

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `.env.local` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function secrets | Secret key for admin writes |
| `SITE_URL` | Edge Function secrets | Full base URL for QR links |

---

## File Structure

```
src/
  lib/
    supabase.js              # Supabase client (shared)
  passport/
    PassportContext.jsx      # Auth + profile state provider
    ProtectedRoute.jsx       # Route guard
    BeerPassportLanding.jsx  # Public landing page (/passport)
    PassportAuth.jsx         # Login + signup (/passport/login)
    PassportProfile.jsx      # User dashboard (/passport/profile)
    CheckIn.jsx              # QR check-in page (/checkin)
    StaffPortal.jsx          # Staff admin (/staff)
    passport.css             # All passport styles

supabase/
  migrations/
    001_beer_passport.sql    # Full schema + seed rewards
  seed.sql                   # Demo data for local testing
  functions/
    checkin/index.ts         # Check-in validation edge function
    generate-token/index.ts  # Daily QR token generation
    redeem-reward/index.ts   # Staff redemption endpoint
```

---

## Deployment

### Recommended: Netlify

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. The `public/_redirects` file handles SPA routing automatically

### Vercel

1. Import the repo into Vercel
2. Framework: Vite
3. Add environment variables
4. The `vercel.json` file handles SPA routing

### GitHub Pages (existing deployment)

GitHub Pages does not support SPA routing natively. Options:
- Add a `404.html` that redirects to `index.html` (see [spa-github-pages](https://github.com/rafgraph/spa-github-pages))
- Or switch to Netlify/Vercel for zero-config SPA support (recommended)

---

## Supabase Email Auth Notes

By default, Supabase requires email confirmation before login works.
For a better signup experience:
- **Disable email confirmation:** Supabase Dashboard → Authentication → Settings → "Enable email confirmations" → OFF
  (fine for an MVP; re-enable later if you add email campaigns)
- **Or use magic link auth** as an alternative to passwords (less friction for customers)

---

## Future Enhancements

Ideas for v2, in rough priority order:

| Enhancement | Notes |
|-------------|-------|
| **Mug Club waitlist integration** | When a customer hits 10+ visits, auto-add them to the Mug Club waitlist for the next enrollment window |
| **SMS alerts** | Twilio/Resend integration to text customers when they unlock a reward |
| **Birthday reward** | Collect birthday month on signup; send a free-pint code in that month |
| **Secret tap drops** | When a new limited release drops, email Passport members 24h before public announcement |
| **Streak bonuses** | Extra stamp for visiting 4+ weeks in a row |
| **Beer ratings** | Let checked-in members rate beers they tried that day |
| **Mug Club tier** | Passport members with 20+ visits get fast-tracked for Mug Club enrollment |
| **Analytics dashboard** | Visit frequency heatmap, retention curves, top members list |
| **Admin token scheduler** | Auto-rotate the QR token at a set time each day (cron job via Supabase pg_cron) |
