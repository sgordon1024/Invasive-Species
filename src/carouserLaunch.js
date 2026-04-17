// Shared launch-date logic for the Carouser Club.
// Single source of truth so the nav button, the promo section, and the
// /carouser-club page all flip in sync.

import { useEffect, useState } from 'react';

// ── The real launch: April 20, 2026, midnight local (Fort Lauderdale) ──
// Update this one line to change the launch moment everywhere.
export const LAUNCH = new Date('2026-04-20T00:00:00');

// ── Preview overrides (for testing — read from the URL) ──
//   ?preview=done       → act as if already launched
//   ?preview=10s        → launch in 10 seconds from now
//   ?preview=2m         → launch in 2 minutes from now
//   ?preview=3h         → launch in 3 hours from now
//   ?preview=5d         → launch in 5 days from now
//   (anything else)     → use real LAUNCH date
function getEffectiveLaunch() {
  if (typeof window === 'undefined') return LAUNCH;
  const raw = new URLSearchParams(window.location.search).get('preview');
  if (!raw) return LAUNCH;
  if (raw === 'done' || raw === 'launched') return new Date(Date.now() - 1000);
  const m = raw.match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!m) return LAUNCH;
  const n = Number(m[1]);
  const mult = { s: 1e3, m: 60e3, h: 3_600e3, d: 86_400e3 }[m[2].toLowerCase()];
  return new Date(Date.now() + n * mult);
}

// Cache the effective launch once per page load so a running countdown
// doesn't reset on every tick.
let cachedLaunch = null;
function effectiveLaunch() {
  if (cachedLaunch === null) cachedLaunch = getEffectiveLaunch();
  return cachedLaunch;
}

export function getTimeLeft() {
  const diff = effectiveLaunch() - Date.now();
  if (diff <= 0) return null;
  return {
    total:   diff,
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  };
}

export function pad(n) {
  return String(n).padStart(2, '0');
}

// Returns null once the launch date passes. Updates once per second.
export function useTimeLeft() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    if (!timeLeft) return;
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1_000);
    return () => clearInterval(id);
  }, [!!timeLeft]);

  return timeLeft;
}
