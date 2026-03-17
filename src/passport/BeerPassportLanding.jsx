// Beer Passport — public landing page.
// Explains the program, shows rewards, and drives signups.

import { Link } from 'react-router-dom';
import { usePassport } from './PassportContext';
import './passport.css';

// Reward milestones displayed on the landing page.
// These are shown statically for marketing purposes;
// the actual rewards are stored in the database (rewards table).
// Milestones shown on the landing page.
// Keep in sync with supabase/migrations/003_updated_rewards.sql
const LANDING_REWARDS = [
  { visits:   5, name: 'First Stamp',      desc: 'Free pint on your next visit.',                   icon: '🍺' },
  { visits:  10, name: 'Frequent Flyer',   desc: '10% off your entire tab.',                        icon: '✈️' },
  { visits:  15, name: 'Taproom Regular',  desc: 'Free Invasive Species sticker pack.',             icon: '🎨' },
  { visits:  20, name: 'Local Legend',     desc: 'Free flight of any 5 beers on tap.',              icon: '⭐' },
  { visits:  25, name: 'Scene Kid',        desc: 'Skip the line on new release days.',              icon: '🚀' },
  { visits:  30, name: 'Mug Club Preview', desc: 'First look at Mug Club enrollment.',              icon: '🏅' },
  { visits:  40, name: 'Brew Crew',        desc: 'Free growler fill — any beer, any size.',         icon: '🫙' },
  { visits:  50, name: 'Inner Circle',     desc: 'Invite to a private brewer tasting event.',       icon: '🎟️' },
  { visits:  75, name: 'Hall of Fame',     desc: 'Your name on the Wall of Fame in the taproom.',   icon: '🏆' },
  { visits: 100, name: 'Invasive Legend',  desc: 'Lifetime 10% off every visit. You are the bar.',  icon: '👑' },
];

export default function BeerPassportLanding() {
  const { user } = usePassport();

  return (
    <div className="pp-page">

      {/* ── Back to site ──────────────────────────────────────────────── */}
      <div style={{ padding: '1rem 1.5rem' }}>
        <Link to="/" style={{ fontSize: '0.82rem', color: '#555', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          ← Back to Invasive Species Brewing
        </Link>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pp-hero">
        <div className="pp-container" style={{ textAlign: 'center' }}>
          <span className="pp-hero__stamp">🛂</span>
          <span className="pp-eyebrow">Invasive Species Brewing</span>
          <h1 className="pp-section-title">
            Drink beer.<br />
            <span className="pp-accent">Earn rewards.</span>
          </h1>
          <p className="pp-lead" style={{ maxWidth: 520, margin: '0 auto 0' }}>
            Check in every time you visit and unlock perks for being a regular.
            No app to download. No punch card to lose. Just great beer and a reason to come back.
          </p>
          <p style={{ fontSize: '0.78rem', color: '#444', marginTop: '1rem' }}>
            10 rewards up to 100 visits · resets January 1st each year
          </p>

          <div className="pp-hero__cta-row">
            {user ? (
              <Link to="/passport/profile" className="pp-btn pp-btn--primary">
                View My Passport
              </Link>
            ) : (
              <>
                <Link to="/passport/login?tab=signup" className="pp-btn pp-btn--primary">
                  Join the Passport
                </Link>
                <Link to="/passport/login" className="pp-btn pp-btn--ghost">
                  I already have one
                </Link>
              </>
            )}
          </div>
        </div>
      </section>


      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="pp-steps">
        <div className="pp-container">
          <span className="pp-eyebrow" style={{ display: 'block', textAlign: 'center' }}>
            How it works
          </span>
          <h2 className="pp-section-title" style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            Three steps. That's it.
          </h2>

          <div className="pp-steps__grid">
            <div className="pp-step">
              <span className="pp-step__icon">📱</span>
              <span className="pp-step__num">1</span>
              <h3>Sign Up Free</h3>
              <p>
                Create your digital passport in under a minute.
                Just your name and email.
              </p>
            </div>

            <div className="pp-step">
              <span className="pp-step__icon">📷</span>
              <span className="pp-step__num">2</span>
              <h3>Scan When You're Here</h3>
              <p>
                Look for the QR code posted in the taproom.
                Scan it to verify your visit — one check-in per day.
              </p>
            </div>

            <div className="pp-step">
              <span className="pp-step__icon">🎁</span>
              <span className="pp-step__num">3</span>
              <h3>Unlock Rewards</h3>
              <p>
                Hit visit milestones to earn perks.
                Show your passport to a bartender to redeem.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── Rewards ──────────────────────────────────────────────────── */}
      <section className="pp-rewards">
        <div className="pp-container">
          <span className="pp-eyebrow" style={{ display: 'block', textAlign: 'center' }}>
            The rewards
          </span>
          <h2 className="pp-section-title" style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            Your next reward is closer than you think.
          </h2>

          <div className="pp-rewards__grid">
            {LANDING_REWARDS.map((r) => (
              <div className="pp-reward-card" key={r.visits}>
                <div className="pp-reward-card__visits">{r.visits}</div>
                <div className="pp-reward-card__label">visits</div>
                <h3>{r.icon} {r.name}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA strip ─────────────────────────────────────────────────── */}
      <section className="pp-cta-strip" style={{ borderTop: '1px solid #111' }}>
        <div className="pp-container">
          <span className="pp-eyebrow">Ready?</span>
          <h2 className="pp-section-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
            Start earning today.
          </h2>
          <p className="pp-lead" style={{ maxWidth: 460, margin: '0 auto 2rem' }}>
            Free to join. No subscription. No spam.
            Just cold beer and a stamp in your passport.
          </p>

          {user ? (
            <Link to="/passport/profile" className="pp-btn pp-btn--primary">
              Open My Passport
            </Link>
          ) : (
            <Link to="/passport/login?tab=signup" className="pp-btn pp-btn--primary">
              Get My Passport — It's Free
            </Link>
          )}
        </div>
      </section>


      {/* ── Fine print footer ─────────────────────────────────────────── */}
      <div style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid #0d0d0d' }}>
        <p style={{ fontSize: '0.75rem', color: '#333', margin: 0 }}>
          Beer Passport is a loyalty program for Invasive Species Brewing, Fort Lauderdale FL.
          Must be 21+ to participate. Not transferable.{' '}
          <Link to="/passport/login" style={{ color: '#444', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
