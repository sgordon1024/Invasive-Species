// =============================================================================
// Edge Function: redeem-reward
// =============================================================================
// Staff-only: marks a reward as redeemed for a member.
//
// POST /functions/v1/redeem-reward
// Authorization: Bearer <staff JWT>
// Body: { memberId: string, rewardId: number }
//
// Validates:
//   - Caller is staff
//   - Member exists and has enough visits
//   - Reward hasn't already been redeemed
//   - Reward is still active
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

  const { data: staffMember } = await admin
    .from('passport_members')
    .select('is_staff, email')
    .eq('id', user.id)
    .single();

  if (!staffMember?.is_staff) {
    return json({ error: 'Forbidden: staff access required' }, 403);
  }

  // ── 2. Parse request body ─────────────────────────────────────────────────
  let memberId: string, rewardId: number;
  try {
    const body = await req.json();
    memberId = body?.memberId?.trim();
    rewardId = Number(body?.rewardId);
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }
  if (!memberId || !rewardId) return json({ error: 'memberId and rewardId are required' }, 400);

  // ── 3. Load the member ────────────────────────────────────────────────────
  const { data: member } = await admin
    .from('passport_members')
    .select('id, first_name, email, total_visits')
    .eq('id', memberId)
    .single();

  if (!member) return json({ error: 'Member not found' }, 404);

  // ── 4. Load the reward ────────────────────────────────────────────────────
  const { data: reward } = await admin
    .from('rewards')
    .select('id, visit_threshold, name, is_active')
    .eq('id', rewardId)
    .single();

  if (!reward) return json({ error: 'Reward not found' }, 404);
  if (!reward.is_active) return json({ error: 'This reward is no longer active' }, 400);

  // ── 5. Verify member has enough visits ────────────────────────────────────
  if (member.total_visits < reward.visit_threshold) {
    return json({
      error: `Member has ${member.total_visits} visits but needs ${reward.visit_threshold} for this reward.`,
    }, 400);
  }

  // ── 6. Check not already redeemed ────────────────────────────────────────
  const { data: existing } = await admin
    .from('redemptions')
    .select('id')
    .eq('member_id', member.id)
    .eq('reward_id', rewardId)
    .single();

  if (existing) {
    return json({ error: 'This reward has already been redeemed by this member.' }, 409);
  }

  // ── 7. Record the redemption ──────────────────────────────────────────────
  const { error: insertError } = await admin.from('redemptions').insert({
    member_id:        member.id,
    reward_id:        rewardId,
    redeemed_by_staff: staffMember.email,
  });
  if (insertError) return json({ error: 'Failed to record redemption' }, 500);

  // ── 8. Audit log ──────────────────────────────────────────────────────────
  await admin.from('audit_logs').insert({
    event_type: 'reward_redeemed',
    member_id:  member.id,
    details: {
      reward_id:   rewardId,
      reward_name: reward.name,
      staff_email: staffMember.email,
    },
    ip_address: ip,
    user_agent: userAgent,
  });

  return json({
    success:     true,
    member:      { firstName: member.first_name, email: member.email },
    rewardName:  reward.name,
    redeemedAt:  new Date().toISOString(),
  }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}
