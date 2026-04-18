// CarouserCountdown — promo section on the main landing page.
//
// Before launch: shows a live countdown to 4/20 — NO link to the page.
// After launch:  the count goes away and a "Join the Club" CTA appears.

import { Link } from 'react-router-dom';
import { trackEvent } from './useAnalytics';
import { useTimeLeft, pad } from './carouserLaunch';

export default function CarouserCountdown() {
  const timeLeft = useTimeLeft();
  const launched = !timeLeft;

  return (
    <section className="cc-countdown-section" id="carouser-club">

      <p className="section-eyebrow">Annual Mug Club</p>
      <h2 className="cc-countdown-heading">
        The Carouser <span className="cc-countdown-accent">Club</span>
      </h2>
      <p className="cc-countdown-sub">
        Your name on the wall. An engraved mug. Exclusive merch, 10% off, and
        members-only events — all year long.
      </p>

      {launched ? (
        /* ── POST-LAUNCH CTA ── */
        <Link
          to="/carouser-club"
          className="cc-countdown-cta cc-countdown-cta--live"
          onClick={() => trackEvent('click_cta', { label: 'carouser_club_join' })}
        >
          Join the Club — $125 / year →
        </Link>
      ) : (
        /* ── COUNTDOWN (no button — doors not open yet) ── */
        <>
          <div className="cc-countdown-timer">
            <div className="cc-countdown-unit">
              <span className="cc-countdown-num">{timeLeft.days}</span>
              <span className="cc-countdown-label">days</span>
            </div>
            <span className="cc-countdown-sep">:</span>
            <div className="cc-countdown-unit">
              <span className="cc-countdown-num">{pad(timeLeft.hours)}</span>
              <span className="cc-countdown-label">hours</span>
            </div>
            <span className="cc-countdown-sep">:</span>
            <div className="cc-countdown-unit">
              <span className="cc-countdown-num">{pad(timeLeft.minutes)}</span>
              <span className="cc-countdown-label">min</span>
            </div>
            <span className="cc-countdown-sep">:</span>
            <div className="cc-countdown-unit">
              <span className="cc-countdown-num">{pad(timeLeft.seconds)}</span>
              <span className="cc-countdown-label">sec</span>
            </div>
          </div>

          <p className="cc-countdown-date">Memberships open Sunday, May 11</p>
          <p className="cc-countdown-early-access">
            Returning member? Early renewal is open now.
          </p>
        </>
      )}

      {/* Perks row — shown both before and after */}
      <div className="cc-countdown-perks">
        {[
          ['🍺', 'Engraved mug on our wall'],
          ['👕', 'Exclusive Carouser Club tee'],
          ['💰', '10% off taproom purchases'],
          ['🎉', 'Members-only events'],
        ].map(([icon, text]) => (
          <div key={text} className="cc-countdown-perk">
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
