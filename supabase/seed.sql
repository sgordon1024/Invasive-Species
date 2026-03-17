-- =============================================================================
-- Beer Passport — Seed / Demo Data
-- =============================================================================
-- This seed creates demo records for local testing.
-- DO NOT run this in production.
--
-- Usage:
--   1. Run the migration first: supabase/migrations/001_beer_passport.sql
--   2. Create a real auth user via Supabase dashboard or auth.signUp()
--   3. Replace the UUID below with that user's auth.users id
--   4. Run this SQL in the Supabase SQL editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Insert a demo passport member (replace UUID with a real auth user id)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE THIS
BEGIN

  INSERT INTO passport_members (id, first_name, email, phone, member_id, total_visits, is_staff)
  VALUES (
    demo_user_id,
    'Alex',
    'demo@invasivespeciesbrewing.com',
    '954-555-0100',
    'ISB-DEMO1',
    7,  -- 7 visits → has unlocked the 5-visit reward, working toward 10
    FALSE
  ) ON CONFLICT (id) DO NOTHING;

  -- Simulate 7 check-ins over the past 2 weeks
  INSERT INTO check_ins (member_id, checked_in_at, token_used, ip_address, is_valid) VALUES
    (demo_user_id, NOW() - INTERVAL '14 days', 'demo-token', '127.0.0.1', TRUE),
    (demo_user_id, NOW() - INTERVAL '13 days', 'demo-token', '127.0.0.1', TRUE),
    (demo_user_id, NOW() - INTERVAL '11 days', 'demo-token', '127.0.0.1', TRUE),
    (demo_user_id, NOW() - INTERVAL '9 days',  'demo-token', '127.0.0.1', TRUE),
    (demo_user_id, NOW() - INTERVAL '7 days',  'demo-token', '127.0.0.1', TRUE),
    (demo_user_id, NOW() - INTERVAL '4 days',  'demo-token', '127.0.0.1', TRUE),
    (demo_user_id, NOW() - INTERVAL '1 day',   'demo-token', '127.0.0.1', TRUE)
  ON CONFLICT DO NOTHING;

  -- Redeem the first reward (5-visit milestone)
  INSERT INTO redemptions (member_id, reward_id, redeemed_by_staff)
  VALUES (demo_user_id, 1, 'staff@invasivespeciesbrewing.com')
  ON CONFLICT DO NOTHING;

END $$;

-- -----------------------------------------------------------------------------
-- Insert a demo staff member (replace UUID with a real auth user id)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  staff_user_id UUID := '00000000-0000-0000-0000-000000000002'; -- REPLACE THIS
BEGIN

  INSERT INTO passport_members (id, first_name, email, member_id, total_visits, is_staff)
  VALUES (
    staff_user_id,
    'Staff',
    'staff@invasivespeciesbrewing.com',
    'ISB-STAFF',
    0,
    TRUE
  ) ON CONFLICT (id) DO NOTHING;

END $$;

-- -----------------------------------------------------------------------------
-- Insert a demo QR token (expires tomorrow)
-- -----------------------------------------------------------------------------
INSERT INTO qr_tokens (token, expires_at, is_active, created_by)
VALUES (
  'DEMO-TOKEN-2024',
  NOW() + INTERVAL '24 hours',
  TRUE,
  'seed script'
) ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Audit log entries
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE THIS
BEGIN
  INSERT INTO audit_logs (event_type, member_id, details, ip_address) VALUES
    ('signup',           demo_user_id, '{"source":"web"}'::jsonb,          '127.0.0.1'),
    ('checkin_success',  demo_user_id, '{"token":"demo-token","visits":1}'::jsonb, '127.0.0.1'),
    ('checkin_success',  demo_user_id, '{"token":"demo-token","visits":5}'::jsonb, '127.0.0.1'),
    ('reward_redeemed',  demo_user_id, '{"reward_id":1,"reward_name":"Frequent Flyer"}'::jsonb, '127.0.0.1');
END $$;
