// =============================================================================
// Edge Function: subscribe
// =============================================================================
// Subscribes an email address to the Mailchimp audience list.
//
// POST /functions/v1/subscribe
// Body: { email: string }
//
// Responses:
//   { status: 'success' }   — subscribed successfully
//   { status: 'duplicate' } — already on the list
//   { error: string }       — validation or server error
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const MAILCHIMP_API_KEY = Deno.env.get('MAILCHIMP_API_KEY')!;
const MAILCHIMP_LIST_ID = Deno.env.get('MAILCHIMP_LIST_ID')!;
const MAILCHIMP_DC      = Deno.env.get('MAILCHIMP_DC')!; // e.g. 'us10'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type':                 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // ── Parse body ──────────────────────────────────────────────────────────
  let email: string;
  try {
    const body = await req.json();
    email = (body?.email ?? '').trim().toLowerCase();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email address' }, 400);
  }

  // ── Call Mailchimp Members API ───────────────────────────────────────────
  const mcUrl = `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
  const auth  = btoa(`anystring:${MAILCHIMP_API_KEY}`);

  const mcRes  = await fetch(mcUrl, {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status:        'subscribed',
    }),
  });

  const mcData = await mcRes.json();

  // Mailchimp returns 400 with title "Member Exists" for duplicates.
  if (!mcRes.ok) {
    if (mcData?.title === 'Member Exists') {
      return json({ status: 'duplicate' }, 200);
    }
    console.error('Mailchimp error:', mcData);
    return json({ error: 'Subscription failed. Please try again.' }, 500);
  }

  return json({ status: 'success' }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}
