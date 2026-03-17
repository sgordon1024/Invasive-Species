// =============================================================================
// Edge Function: generate-token
// =============================================================================
// Generates a new daily QR token. Staff-only.
//
// POST /functions/v1/generate-token
// Authorization: Bearer <staff JWT>
// Body: { validHours?: number }  — defaults to 20 hours
//
// Returns: { token, expiresAt, qrUrl }
// The caller displays the QR code using qrUrl (the full check-in URL).
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL         = Deno.env.get('SITE_URL') || 'https://invasivespeciesbrewing.com';

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
  const admin     = createClient(SUPABASE_URL, SUPABASE_SERVICE);

  // ── 1. Verify staff auth ──────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: 'Unauthorized' }, 401);

  // Verify the caller has is_staff = true.
  const { data: member } = await admin
    .from('passport_members')
    .select('is_staff, email, first_name')
    .eq('id', user.id)
    .single();

  if (!member?.is_staff) {
    return json({ error: 'Forbidden: staff access required' }, 403);
  }

  // ── 2. Parse options ──────────────────────────────────────────────────────
  let validHours = 20;
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.validHours && typeof body.validHours === 'number') {
      validHours = Math.min(Math.max(body.validHours, 1), 48); // clamp 1–48h
    }
  } catch { /* use default */ }

  // ── 3. Deactivate all currently active tokens ─────────────────────────────
  await admin
    .from('qr_tokens')
    .update({ is_active: false })
    .eq('is_active', true);

  // ── 4. Generate a new cryptographically random token ─────────────────────
  // 32 bytes → 64-char hex string. Hard to guess or brute-force.
  const rawBytes  = crypto.getRandomValues(new Uint8Array(32));
  const token     = Array.from(rawBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = new Date(Date.now() + validHours * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await admin.from('qr_tokens').insert({
    token,
    expires_at:  expiresAt,
    is_active:   true,
    created_by:  member.email,
  });
  if (insertError) return json({ error: 'Failed to create token' }, 500);

  // ── 5. Log the action ─────────────────────────────────────────────────────
  await admin.from('audit_logs').insert({
    event_type: 'token_generated',
    member_id:  user.id,
    details:    { valid_hours: validHours, expires_at: expiresAt },
    ip_address: ip,
    user_agent: userAgent,
  });

  // ── 6. Return the token and check-in URL ──────────────────────────────────
  const checkInUrl = `${SITE_URL}/checkin?token=${token}`;

  return json({
    token,
    expiresAt,
    validHours,
    checkInUrl,
    // The QR code image URL uses a free public QR generator. Staff portal
    // displays this as an <img> tag — no client-side library needed.
    qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(checkInUrl)}`,
  }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}
