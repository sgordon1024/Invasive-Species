import { useState } from 'react';
import './CarouserClub.css';

const ACCENT = '#39FF14';
const PRICE = 125;

const SHIRT_SIZES = ['S', 'M', 'L', 'XL', '2XL'];

const emptyForm = {
  mugName: '',
  shirtSize: '',
  name: '', email: '',
  card: '', expiry: '', cvv: '',
};

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + ' / ' + digits.slice(2) : digits;
}

const PERKS = [
  { icon: '🍺', text: 'Custom engraved mug kept on our wall' },
  { icon: '👕', text: 'Exclusive Carouser Club T-shirt' },
  { icon: '🎉', text: 'Members-only events & tastings' },
  { icon: '💰', text: '10% off all taproom purchases' },
  { icon: '🥇', text: 'Early access to limited releases' },
];

export default function CarouserClub() {
  const [step, setStep] = useState('details');
  // steps: 'details' | 'payment' | 'confirm'
  const [form, setForm] = useState(emptyForm);
  const [orderNumber] = useState(() => Math.floor(10000 + Math.random() * 90000));
  const [errors, setErrors] = useState({});

  const handleFormChange = (e) => {
    let { name, value } = e.target;
    if (name === 'card') value = formatCard(value);
    if (name === 'expiry') value = formatExpiry(value);
    if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const goToPayment = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.mugName.trim()) newErrors.mugName = 'Please enter a name for your mug';
    if (!form.shirtSize) newErrors.shirtSize = 'Please select a T-shirt size';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = (e) => {
    e.preventDefault();
    setStep('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepLabels = ['Membership', 'Payment'];
  const stepIndex = { details: 0, payment: 1, confirm: 2 };

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

      {/* ── PROGRESS BAR ── */}
      {step !== 'confirm' && (
        <div className="cc-progress">
          {stepLabels.map((label, i) => (
            <div key={label} className={`progress-step${stepIndex[step] >= i ? ' active' : ''}`}>
              <div className="progress-dot" />
              <span>{label}</span>
              {i < stepLabels.length - 1 && <div className="progress-line" />}
            </div>
          ))}
        </div>
      )}

      {/* ── FORM CONTAINER ── */}
      <div className="cc-form-container">

        {/* ── STEP 1: MEMBERSHIP DETAILS ── */}
        {step === 'details' && (
          <form className="cc-form" onSubmit={goToPayment}>
            <h2 className="cc-form-title">Customize Your Membership</h2>

            <div className="form-group">
              <label htmlFor="cc-mug-name">Name for Your Mug</label>
              <input
                id="cc-mug-name"
                name="mugName"
                placeholder='e.g. "Big Steve", "The Carouser"'
                value={form.mugName}
                onChange={handleFormChange}
                required
                maxLength={30}
                autoFocus
              />
              <span className="cc-field-hint">This will be engraved on your personal mug (max 30 characters)</span>
              {errors.mugName && <span className="cc-field-error">{errors.mugName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cc-shirt-size">T-Shirt Size</label>
              <div className="cc-size-picker">
                {SHIRT_SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    className={`cc-size-btn${form.shirtSize === size ? ' selected' : ''}`}
                    onClick={() => {
                      setForm(prev => ({ ...prev, shirtSize: size }));
                      if (errors.shirtSize) setErrors(prev => ({ ...prev, shirtSize: '' }));
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {errors.shirtSize && <span className="cc-field-error">{errors.shirtSize}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cc-name">Full Name</label>
              <input id="cc-name" name="name" placeholder="Jane Smith" value={form.name} onChange={handleFormChange} required autoComplete="name" />
            </div>
            <div className="form-group">
              <label htmlFor="cc-email">Email</label>
              <input id="cc-email" name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleFormChange} required autoComplete="email" />
            </div>

            <div className="cc-order-summary">
              <div className="cc-summary-line">
                <span>Carouser Club Membership</span>
                <span style={{ color: ACCENT, fontWeight: 700 }}>${PRICE}.00</span>
              </div>
              {form.mugName && (
                <div className="cc-summary-detail">Mug: "{form.mugName}"</div>
              )}
              {form.shirtSize && (
                <div className="cc-summary-detail">T-Shirt: {form.shirtSize}</div>
              )}
            </div>

            <button type="submit" className="checkout-btn">
              Continue to Payment →
            </button>
          </form>
        )}

        {/* ── STEP 2: PAYMENT ── */}
        {step === 'payment' && (
          <form className="cc-form" onSubmit={placeOrder}>
            <button type="button" className="cc-back-btn" onClick={() => setStep('details')}>
              ← Back
            </button>
            <h2 className="cc-form-title">Payment</h2>

            <div className="demo-notice">
              Demo only — no real charge will be made.
            </div>

            <div className="form-group">
              <label htmlFor="cc-card">Card Number</label>
              <input id="cc-card" name="card" placeholder="1234 5678 9012 3456" value={form.card} onChange={handleFormChange} required inputMode="numeric" autoComplete="cc-number" />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="cc-expiry">Expiry</label>
                <input id="cc-expiry" name="expiry" placeholder="MM / YY" value={form.expiry} onChange={handleFormChange} required inputMode="numeric" autoComplete="cc-exp" />
              </div>
              <div className="form-group">
                <label htmlFor="cc-cvv">CVV</label>
                <input id="cc-cvv" name="cvv" placeholder="123" value={form.cvv} onChange={handleFormChange} maxLength={4} required inputMode="numeric" autoComplete="cc-csc" />
              </div>
            </div>

            <div className="cc-order-summary">
              <div className="cc-summary-line">
                <span>Carouser Club Membership</span>
                <span style={{ color: ACCENT, fontWeight: 700 }}>${PRICE}.00</span>
              </div>
              <div className="cc-summary-detail">Mug: "{form.mugName}" &middot; Shirt: {form.shirtSize}</div>
            </div>

            <button type="submit" className="checkout-btn checkout-btn-confirm">
              Place Order — ${PRICE}.00
            </button>
          </form>
        )}

        {/* ── CONFIRMATION ── */}
        {step === 'confirm' && (
          <div className="cc-confirm">
            <div className="confirm-icon" style={{ color: ACCENT }}>✓</div>
            <h2 className="confirm-title">Welcome to the Club!</h2>
            <p className="confirm-order-num">Order #{orderNumber}</p>
            <p className="cc-confirm-msg">
              Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}! Your Carouser Club membership is confirmed.
            </p>
            <div className="cc-confirm-details">
              <div className="cc-confirm-detail-row">
                <span className="cc-confirm-label">Mug Name</span>
                <span className="cc-confirm-value">"{form.mugName}"</span>
              </div>
              <div className="cc-confirm-detail-row">
                <span className="cc-confirm-label">T-Shirt Size</span>
                <span className="cc-confirm-value">{form.shirtSize}</span>
              </div>
            </div>
            {form.email && (
              <p className="cc-confirm-email">
                A receipt will be sent to <strong>{form.email}</strong>.
              </p>
            )}
            <p className="cc-confirm-pickup">
              Pick up your mug and T-shirt at the taproom. We'll email you when everything's ready!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
