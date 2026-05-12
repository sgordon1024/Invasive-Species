import { trackEvent } from './useAnalytics';
import './CarouserClub.css';

const ACCENT = '#39FF14';
const PRICE = 125;

const PERKS = [
  { icon: '🍺', text: 'Custom engraved mug kept at the bar' },
  { icon: '👕', text: 'Exclusive Carouser Club T-shirt' },
  { icon: '🎉', text: '$1 off every pint purchased!' },
  { icon: '💰', text: '10% off all merchandise purchases' },
  { icon: '🥇', text: 'Early access to limited releases' },
];

const STRIPE_URL = 'https://buy.stripe.com/28E00i1JI5Rj3EacGE5Ne01';

export default function CarouserClub() {
  return (
    <section className="cc-section">
      {/* ── HERO ── */}
      <div className="cc-hero">
        <p className="section-eyebrow">Invasive Species Brewing</p>
        <h1 className="cc-title">
          The Carouser <span style={{ color: ACCENT }}>Club</span>
        </h1>
        <p className="cc-subtitle">
          Our annual mug club membership. Get your name on the wall, exclusive merch, and VIP perks all year long.
        </p>
        <div className="cc-price-badge">
          <span className="cc-price-amount">${PRICE}</span>
          <span className="cc-price-label">/ year</span>
        </div>
      </div>

      {/* ── PERKS ── */}
      <div className="cc-perks">
        {PERKS.map((perk, i) => (
          <div key={i} className="cc-perk">
            <span className="cc-perk-icon">{perk.icon}</span>
            <span className="cc-perk-text">{perk.text}</span>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="cc-cta">
        <a
          href={STRIPE_URL}
          className="checkout-btn"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('carouser_club_checkout_click')}
        >
          Join the Club — ${PRICE} / year
        </a>
        <p className="cc-cta-note">Secure checkout via Stripe</p>
      </div>
    </section>
  );
}
