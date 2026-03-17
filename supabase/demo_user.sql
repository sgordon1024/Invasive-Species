-- =============================================================================
-- Demo user setup: 16 visits, first reward redeemed, working toward reward 2
-- Run AFTER signing up demo@invasivespeciesbrewing.com through the app.
-- =============================================================================

DO $$
DECLARE
  demo_id UUID;
BEGIN
  SELECT id INTO demo_id
  FROM passport_members
  WHERE email = 'sgordon1024@gmail.com';

  IF demo_id IS NULL THEN
    RAISE EXCEPTION 'User not found in passport_members.';
  END IF;

  -- Set visit count to 16
  UPDATE passport_members
  SET total_visits = 16
  WHERE id = demo_id;

  -- Add 16 check-ins spread across the past 5 weeks
  INSERT INTO check_ins (member_id, checked_in_at, token_used, ip_address, is_valid) VALUES
    (demo_id, NOW() - INTERVAL '35 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '33 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '30 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '28 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '26 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '23 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '21 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '18 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '16 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '14 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '11 days', 'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '9 days',  'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '7 days',  'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '4 days',  'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '2 days',  'demo', '127.0.0.1', TRUE),
    (demo_id, NOW() - INTERVAL '1 day',   'demo', '127.0.0.1', TRUE);

  -- Mark the 5-visit reward as already redeemed (they've been here a while)
  INSERT INTO redemptions (member_id, reward_id, redeemed_by_staff)
  VALUES (demo_id, 1, 'staff@invasivespeciesbrewing.com')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Demo user set up: 16 visits, reward 1 redeemed. ID: %', demo_id;
END $$;
