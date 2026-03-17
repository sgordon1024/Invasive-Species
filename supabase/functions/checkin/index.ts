// =============================================================================
// Edge Function: checkin
// =============================================================================
// Validates a QR-code check-in and records the visit.
//
// POST /functions/v1/checkin
// Body: { token: string }
// Authorization: Bearer <user JWT>
//
// Anti-abuse logic:
//   - User must be authenticated (JWT required)
//   - Token must exist in qr_tokens and not be expired
//   - Only one valid check-in per user per calendar day (America/New_York)
//   - Rate limit: max 10 check-in attempts per user per hour
//   - IP rate limit: max 30 attempts per IP per hour
//   - All attempts logged to audit_logs for fraud review
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TZ               = 'America/New_York'; // Brewery timezone

// CORS headers — tighten origin to your domain in production.
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type':                 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const ip        = req.headers.get('x-forwarded-for') ?? 'unknown';
  const userAgent = req.headers.get('user-agent') ?? '';

  // Service-role client bypasses RLS for server-authoritative writes.
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE);

  // ── 1. Authenticate the user from their JWT ──────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const userClient  = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // ── 2. Parse request body ────────────────────────────────────────────────
  let token: string;
  try {
    const body = await req.json();
    token = body?.token?.trim();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }
  if (!token) return json({ error: 'Missing token' }, 400);

  // ── 3. Load the member profile ───────────────────────────────────────────
  const { data: member, error: memberError } = await admin
    .from('passport_members')
    .select('id, first_name, total_visits')
    .eq('id', user.id)
    .single();

  if (memberError || !member) {
    await logEvent(admin, 'checkin_blocked', null, { reason: 'member_not_found', token }, ip, userAgent);
    return json({ error: 'Passport not found. Please sign up first.' }, 404);
  }

  // ── 4. IP rate limit (30 attempts per IP per hour) ───────────────────────
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: ipCount } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .in('event_type', ['checkin_attempt', 'checkin_blocked'])
    .eq('ip_address', ip)
    .gte('created_at', oneHourAgo);

  if ((ipCount ?? 0) >= 30) {
    await logEvent(admin, 'checkin_blocked', member.id, { reason: 'ip_rate_limit' }, ip, userAgent);
    return json({ error: 'Too many requests. Try again later.' }, 429);
  }

  // ── 5. User rate limit (10 attempts per hour) ────────────────────────────
  const { count: userCount } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .in('event_type', ['checkin_attempt', 'checkin_blocked'])
    .eq('member_id', member.id)
    .gte('created_at', oneHourAgo);

  if ((userCount ?? 0) >= 10) {
    await logEvent(admin, 'checkin_blocked', member.id, { reason: 'user_rate_limit' }, ip, userAgent);
    return json({ error: 'Too many check-in attempts. Try again later.' }, 429);
  }

  // Log the attempt before further validation (even if it ultimately fails).
  await logEvent(admin, 'checkin_attempt', member.id, { token }, ip, userAgent);

  // ── 6. Validate the QR token ─────────────────────────────────────────────
  const { data: qrToken } = await admin
    .from('qr_tokens')
    .select('id, expires_at, is_active')
    .eq('token', token)
    .single();

  if (!qrToken || !qrToken.is_active) {
    await logEvent(admin, 'checkin_blocked', member.id, { reason: 'invalid_token', token }, ip, userAgent);
    return json({
      error: 'This check-in link is not active. Ask a staff member for today\'s QR code.',
      code: 'invalid_token',
    }, 400);
  }

  if (new Date(qrToken.expires_at) < new Date()) {
    await logEvent(admin, 'checkin_blocked', member.id, { reason: 'expired_token', token }, ip, userAgent);
    return json({
      error: 'This QR code has expired. Ask a staff member for today\'s QR code.',
      code: 'expired_token',
    }, 400);
  }

  // ── 7. One check-in per calendar day (brewery timezone) ──────────────────
  const todayStart = startOfDayInTZ(TZ);
  const { data: existingToday } = await admin
    .from('check_ins')
    .select('id')
    .eq('member_id', member.id)
    .eq('is_valid', true)
    .gte('checked_in_at', todayStart)
    .limit(1)
    .single();

  if (existingToday) {
    await logEvent(admin, 'checkin_blocked', member.id, { reason: 'already_checked_in_today' }, ip, userAgent);
    return json({
      error: 'You\'ve already checked in today. Come back tomorrow!',
      code:  'already_checked_in',
    }, 409);
  }

  // ── 8. Record the valid check-in ─────────────────────────────────────────
  const { error: insertError } = await admin.from('check_ins').insert({
    member_id:    member.id,
    token_used:   token,
    ip_address:   ip,
    user_agent:   userAgent,
    is_valid:     true,
  });
  if (insertError) throw insertError;

  // Atomically increment the visit counter.
  const { data: newCount } = await admin.rpc('increment_visits', {
    p_member_id: member.id,
  });

  const totalVisits: number = newCount ?? member.total_visits + 1;

  await logEvent(admin, 'checkin_success', member.id, {
    token,
    total_visits: totalVisits,
  }, ip, userAgent);

  // ── 9. Check if a reward milestone was just crossed ──────────────────────
  const { data: rewards } = await admin
    .from('rewards')
    .select('id, visit_threshold, name, description')
    .eq('is_active', true)
    .order('visit_threshold', { ascending: true });

  const { data: redeemed } = await admin
    .from('redemptions')
    .select('reward_id')
    .eq('member_id', member.id);

  const redeemedIds = new Set((redeemed ?? []).map((r: any) => r.reward_id));

  // Find newly unlocked rewards (just crossed the threshold on this check-in).
  const newlyUnlocked = (rewards ?? []).filter((r: any) =>
    totalVisits >= r.visit_threshold &&
    member.total_visits < r.visit_threshold &&
    !redeemedIds.has(r.id)
  );

  // Find the next milestone to show progress toward.
  const nextReward = (rewards ?? []).find((r: any) => totalVisits < r.visit_threshold);

  return json({
    success:      true,
    totalVisits,
    firstName:    member.first_name,
    newlyUnlocked,
    nextReward:   nextReward ?? null,
    visitsToNext: nextReward ? nextReward.visit_threshold - totalVisits : 0,
  }, 200);
});


// ── Helpers ─────────────────────────────────────────────────────────────────

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

async function logEvent(
  admin: ReturnType<typeof createClient>,
  eventType: string,
  memberId: string | null,
  details: Record<string, unknown>,
  ip: string,
  userAgent: string,
) {
  await admin.from('audit_logs').insert({
    event_type: eventType,
    member_id:  memberId,
    details,
    ip_address: ip,
    user_agent: userAgent,
  });
}

// Returns the ISO string for midnight (00:00:00) of the current day in the
// given IANA timezone. Used to bound the "already checked in today" query.
function startOfDayInTZ(tz: string): string {
  const now    = new Date();
  const parts  = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);

  const year  = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day   = parts.find(p => p.type === 'day')!.value;

  // Construct midnight in the timezone, then convert to UTC.
  return new Date(`${year}-${month}-${day}T00:00:00`).toISOString();
}
