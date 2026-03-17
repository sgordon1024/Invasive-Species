-- =============================================================================
-- Replace default rewards with full 100-visit annual progression
-- =============================================================================
-- Run in Supabase SQL Editor.
-- Safe to re-run — clears and reseeds the rewards table.
-- =============================================================================

-- Clear existing rewards (cascade won't touch redemptions foreign keys,
-- but we want a clean slate for the milestone structure).
TRUNCATE rewards RESTART IDENTITY CASCADE;

INSERT INTO rewards (visit_threshold, name, description, sort_order) VALUES
  ( 5,  'First Stamp',       'Free pint on your next visit — welcome to the flock.',                          1),
  (10,  'Frequent Flyer',    '10% off your entire tab. You''ve earned it.',                                   2),
  (15,  'Taproom Regular',   'Free Invasive Species sticker pack. Represent.',                                 3),
  (20,  'Local Legend',      'Free flight of any 5 beers on tap.',                                            4),
  (25,  'Scene Kid',         'Skip the line on new release days. Front of the pack.',                         5),
  (30,  'Mug Club Preview',  'First look at Mug Club enrollment before it opens to the public.',              6),
  (40,  'Brew Crew',         'Free growler fill — any beer, any size.',                                       7),
  (50,  'Inner Circle',      'Invite to a private tasting event with the brewers.',                           8),
  (75,  'Hall of Fame',      'Your name on the Wall of Fame in the taproom.',                                 9),
  (100, 'Invasive Legend',   'Lifetime 10% off every visit + permanent Wall of Fame. You are the bar.',      10);
