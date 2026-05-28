import { useState } from 'react';
import { trackEvent } from './useAnalytics';
import posterImg from './assets/heavy-kettle-poster.webp';
import './HomebrewComp.css';

const BEER_STYLES = [
  'American Lager', 'American Pale Ale', 'American IPA', 'Double / Imperial IPA',
  'Hazy / New England IPA', 'American Amber / Red Ale', 'American Brown Ale',
  'American Porter', 'American Stout', 'Imperial Stout', 'Blonde Ale',
  'Hefeweizen', 'Witbier', 'Saison / Farmhouse Ale', 'Belgian Strong Ale',
  'Sour / Wild Ale', 'Gose', 'Berliner Weisse', 'Cream Ale',
  'Kölsch', 'Munich Helles', 'Märzen / Oktoberfest', 'Pilsner',
  'Scotch Ale / Wee Heavy', 'English Bitter', 'English Pale Ale',
  'Barleywine', 'Fruit Beer', 'Spiced / Herb / Vegetable Beer',
  'Smoke Beer', 'Other',
];

const empty = {
  brewerName: '',
  clubAffiliation: '',
  beerName: '',
  beerStyle: '',
  abv: '',
  phone: '',
  email: '',
};

export default function HomebrewComp() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.brewerName.trim())  e.brewerName  = 'Required';
    if (!form.beerName.trim())    e.beerName    = 'Required';
    if (!form.beerStyle)          e.beerStyle   = 'Please select a style';
    if (!form.abv.trim())         e.abv         = 'Required';
    if (!form.phone.trim())       e.phone       = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    trackEvent('homebrew_comp_submit');
    try {
      const url = import.meta.env.VITE_HOMEBREW_SHEET_URL;
      if (url) {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, submittedAt: new Date().toISOString() }),
        });
      }
    } catch (_) {
      // submission errors shouldn't block the confirmation screen
    }
    setSubmitting(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="hbc-section">

      {/* ── HERO ── */}
      <div className="hbc-hero">
        <p className="hbc-eyebrow">A Metal Themed Homebrew Contest</p>
        <h1 className="hbc-title">Heavy Kettle<br />Homebrew Contest</h1>
      </div>

      {/* ── POSTER + BODY ── */}
      <div className="hbc-content-row">
        <img src={posterImg} alt="Heavy Kettle Homebrew Contest poster" className="hbc-poster" />
        <div className="hbc-content-text">
          <p className="hbc-body">
            We're hosting our first-ever homebrew competition on <strong>August 15th</strong> — and we want your beer on tap.
            Whether you're a weekend warrior or a seasoned club brewer, if you've got something worth drinking, we want to know about it.
            Submit your entry below. We'll review all applications and announce selected contestants on <strong>June 16th</strong>.
          </p>

          {/* ── PRIZES ── */}
          <div className="hbc-prizes">
            <div className="hbc-prize">
              <span className="hbc-prize-icon">🏆</span>
              <div>
                <div className="hbc-prize-title">1st Place — Judges' Choice</div>
                <div className="hbc-prize-desc">Win a brewday (Mon–Thurs) at Invasive Species where your winning beer will be brewed and served on tap.</div>
              </div>
            </div>
            <div className="hbc-prize">
              <span className="hbc-prize-icon">🤘</span>
              <div>
                <div className="hbc-prize-title">Crowd Favorite</div>
                <div className="hbc-prize-desc">Additional prizes for the crowd's pick.</div>
              </div>
            </div>
            <div className="hbc-prize">
              <span className="hbc-prize-icon">🎸</span>
              <div>
                <div className="hbc-prize-title">Live Metal Show</div>
                <div className="hbc-prize-desc">Doors open at 12PM. Live metal show at 9:00PM.</div>
              </div>
            </div>
          </div>

          {/* ── INFO CARDS ── */}
          <div className="hbc-info-row">
            <div className="hbc-info-card">
              <div className="hbc-info-card-label">Entries Announced</div>
              <div className="hbc-info-card-value">June 16th</div>
            </div>
            <div className="hbc-info-card">
              <div className="hbc-info-card-label">Competition Date</div>
              <div className="hbc-info-card-value accent">Aug 15th · 12–2PM</div>
            </div>
            <div className="hbc-info-card">
              <div className="hbc-info-card-label">Location</div>
              <div className="hbc-info-card-value">726 NE 2nd Ave, Fort Lauderdale</div>
            </div>
          </div>

          <div className="hbc-fine-print">
            <p>* Selected brewers will be contacted directly with drop-off instructions.</p>
            <p>** Brewers will need to bring at least 3 gallons of their entry on event day, as well as any dispensing equipment.</p>
          </div>
        </div>
      </div>

      <hr className="hbc-divider" />

      {/* ── FORM ── */}
      <div className="hbc-form-wrap">
        {submitted ? (
          <div className="hbc-confirm">
            <div className="hbc-confirm-icon">✓</div>
            <h2 className="hbc-confirm-title">You're In the Mix!</h2>
            <p className="hbc-confirm-msg">
              Thanks{form.brewerName ? `, ${form.brewerName.split(' ')[0]}` : ''}! We've received your entry for <strong style={{ color: '#fff' }}>{form.beerName}</strong>.
              We'll be in touch by June 16th to let you know if you've been selected.
            </p>
            <p className="hbc-confirm-note">
              Keep an eye on <strong>{form.email}</strong> — that's where we'll send your drop-off instructions if you make the cut.
            </p>
          </div>
        ) : (
          <>
            <h2 className="hbc-form-title">Enter the Competition</h2>
            <form className="hbc-form" onSubmit={handleSubmit} noValidate>

              <div className="form-group">
                <label htmlFor="hbc-brewer-name">Brewer Name</label>
                <input
                  id="hbc-brewer-name"
                  name="brewerName"
                  placeholder="Your name"
                  value={form.brewerName}
                  onChange={handleChange}
                />
                {errors.brewerName && <span className="hbc-field-error">{errors.brewerName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="hbc-club">Club Affiliation <span style={{ color: '#555' }}>(optional)</span></label>
                <input
                  id="hbc-club"
                  name="clubAffiliation"
                  placeholder="e.g. South Florida Homebrew Club"
                  value={form.clubAffiliation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hbc-beer-name">Beer Name</label>
                <input
                  id="hbc-beer-name"
                  name="beerName"
                  placeholder="What's it called?"
                  value={form.beerName}
                  onChange={handleChange}
                />
                {errors.beerName && <span className="hbc-field-error">{errors.beerName}</span>}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="hbc-beer-style">Beer Style</label>
                  <select
                    id="hbc-beer-style"
                    name="beerStyle"
                    value={form.beerStyle}
                    onChange={handleChange}
                  >
                    <option value="">Select a style</option>
                    {BEER_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.beerStyle && <span className="hbc-field-error">{errors.beerStyle}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="hbc-abv">ABV</label>
                  <input
                    id="hbc-abv"
                    name="abv"
                    placeholder="e.g. 6.5%"
                    value={form.abv}
                    onChange={handleChange}
                    inputMode="decimal"
                  />
                  {errors.abv && <span className="hbc-field-error">{errors.abv}</span>}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="hbc-phone">Phone Number</label>
                  <input
                    id="hbc-phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                  {errors.phone && <span className="hbc-field-error">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="hbc-email">Email</label>
                  <input
                    id="hbc-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <span className="hbc-field-error">{errors.email}</span>}
                </div>
              </div>

              <button type="submit" className="hbc-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit My Entry →'}
              </button>

            </form>
          </>
        )}
      </div>

    </section>
  );
}
