import React, { useState, useEffect, useCallback } from 'react';
import './CarouserPitch.css';

const PASSWORD = 'carouser';

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function Particles() {
  return (
    <div className="cp-particles" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className={`cp-particle cp-p${i + 1}`} />
      ))}
    </div>
  );
}

// ─── PASSWORD GATE ─────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [val, setVal] = useState('');
  const [shake, setShake] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (val.toLowerCase().trim() === PASSWORD) {
      onUnlock();
    } else {
      setShake(true);
      setVal('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="cp-gate">
      <div className="cp-gate-brand">Invasive Species</div>
      <div className="cp-gate-hint">Confidential · Enter Access Code</div>
      <form onSubmit={submit} className="cp-gate-form">
        <input
          className={`cp-gate-input${shake ? ' shake' : ''}`}
          type="password"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="••••••••"
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
        <button className="cp-gate-btn" type="submit">Enter</button>
      </form>
    </div>
  );
}

// ─── SLIDE 0: TITLE ────────────────────────────────────────────────────────────
function SlideTitle() {
  return (
    <div className="cp-slide s-title">
      <Particles />
      <div className="s-title-eyebrow">Invasive Species Brewing</div>
      <h1 className="s-title-heading">
        Carouser Club<span className="s-title-version">2.0</span>
      </h1>
      <div className="s-title-rule" />
      <p className="s-title-sub">A tiered loyalty program brief · April 2025</p>
    </div>
  );
}

// ─── SLIDE 1: OPPORTUNITY ──────────────────────────────────────────────────────
function SlideOpportunity() {
  return (
    <div className="cp-slide s-generic">
      <div className="cp-label">The Opportunity</div>
      <h2 className="cp-h2">The Assets Are Already Here</h2>
      <p className="cp-intro">
        ISB has everything needed to build a market-leading loyalty program.
        The community exists — it just needs a reason to commit.
      </p>
      <div className="cp-stat-grid">
        <div className="cp-stat-card">
          <div className="cp-stat-num">13,993</div>
          <div className="cp-stat-label">Unique Untappd Users</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-num">78,714</div>
          <div className="cp-stat-label">Total Untappd Check-ins</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-num">515</div>
          <div className="cp-stat-label">Unique Beers Catalogued</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-num">24</div>
          <div className="cp-stat-label">Rotating Taps</div>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE 2: COMPETITION ──────────────────────────────────────────────────────
function SlideCompetition() {
  return (
    <div className="cp-slide s-generic">
      <div className="cp-label">The Market</div>
      <h2 className="cp-h2">What South Florida Is Already Doing</h2>
      <div className="cp-comp-grid">
        <div className="cp-comp-card featured">
          <div className="cp-comp-tag">Most Relevant</div>
          <div className="cp-comp-name">Funky Buddha</div>
          <div className="cp-comp-price">$50 – $150 / year</div>
          <div className="cp-comp-detail">Engraved 18-oz snifter · 2-oz larger pours · 10% off merch · extended happy hour</div>
          <div className="cp-comp-status green">SOLD OUT — WAITLIST</div>
        </div>
        <div className="cp-comp-card">
          <div className="cp-comp-name">3 Sons Brewing</div>
          <div className="cp-comp-price">$225 – $425 / year</div>
          <div className="cp-comp-detail">Bottle club · OZNR digital card · 10% off beer · 20% off merch · lottery-based renewal</div>
          <div className="cp-comp-status muted">CAPPED — LOTTERY</div>
        </div>
        <div className="cp-comp-card">
          <div className="cp-comp-name">Tripping Animals</div>
          <div className="cp-comp-price">$25 / month</div>
          <div className="cp-comp-detail">$15 credit at signup · monthly pint + 4-pack pickup · modern subscription hybrid</div>
          <div className="cp-comp-status outline">MODERN SUBSCRIPTION</div>
        </div>
      </div>
      <div className="cp-callout">
        Funky Buddha validates the model. ISB needs to outflank it — not copy it.
      </div>
    </div>
  );
}

// ─── SLIDE 3: SCIENCE ─────────────────────────────────────────────────────────
function SlideScience() {
  return (
    <div className="cp-slide s-generic">
      <div className="cp-label">The Evidence</div>
      <h2 className="cp-h2">What the Research Says</h2>
      <div className="s-sci-hero">
        <span className="s-sci-pct">60%</span>
        <div className="s-sci-hero-text">
          <span className="s-sci-hero-label">higher incremental spend</span>
          <span className="s-sci-hero-source">for paid members vs. free programs — McKinsey 2020</span>
        </div>
      </div>
      <div className="s-sci-facts">
        <div className="s-sci-fact">
          <span className="s-sci-num">2×</span>
          <div>
            <div className="s-sci-fact-label">more motivating than gain</div>
            <div className="s-sci-fact-sub">Loss aversion — Kahneman &amp; Tversky, 1979</div>
          </div>
        </div>
        <div className="s-sci-fact">
          <span className="s-sci-num">98%</span>
          <div>
            <div className="s-sci-fact-label">SMS open rate within 3 min</div>
            <div className="s-sci-fact-sub">Vibes / Hospitality Tech, 2025</div>
          </div>
        </div>
        <div className="s-sci-fact">
          <span className="s-sci-num">34%</span>
          <div>
            <div className="s-sci-fact-label">completion with endowed progress</div>
            <div className="s-sci-fact-sub">vs. 19% without — Nunes &amp; Drèze, 2006</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE 4: TIERS ───────────────────────────────────────────────────────────
function SlideTiers() {
  return (
    <div className="cp-slide s-generic">
      <div className="cp-label">The Structure</div>
      <h2 className="cp-h2">The ISB Taxonomy</h2>
      <div className="s-tiers-grid">
        <div className="s-tier free">
          <div className="s-tier-name">Curly-Tail Crew</div>
          <div className="s-tier-price">Free</div>
          <div className="s-tier-cap">Unlimited</div>
          <ul className="s-tier-perks">
            <li>Email &amp; SMS list</li>
            <li>Birthday pour</li>
            <li>Stamp card <span className="hi">(2 pre-loaded at signup)</span></li>
            <li>Free flight every 10 visits</li>
            <li>Double-stamp Mondays</li>
          </ul>
        </div>
        <div className="s-tier workhorse">
          <div className="s-tier-badge">The Workhorse</div>
          <div className="s-tier-name">Carouser Club</div>
          <div className="s-tier-price">$50 / year</div>
          <div className="s-tier-cap">Unlimited</div>
          <ul className="s-tier-perks">
            <li>Numbered 20-oz mug on the wall</li>
            <li>Mug pour at pint price <span className="hi">(+25% more beer)</span></li>
            <li>$1 off all drafts</li>
            <li>10% off merch</li>
            <li>Wednesday "Pre-Pour" first looks</li>
            <li>Monthly SMS surprise drops</li>
          </ul>
        </div>
        <div className="s-tier apex">
          <div className="s-tier-badge apex-tag">⚠ Capped at 150</div>
          <div className="s-tier-name">Apex Invader</div>
          <div className="s-tier-price">$175 / year</div>
          <div className="s-tier-cap">Limited — Waitlisted</div>
          <ul className="s-tier-perks">
            <li>Everything in Carouser Club</li>
            <li>3-hr early window on every limited release</li>
            <li>4 reserved cans/bottles per quarter</li>
            <li>Annual taxidermy-themed brewer dinner</li>
            <li>Distillery cocktail class</li>
            <li>Quarterly "Bring an Invader" guest pass</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE 5: REVENUE ─────────────────────────────────────────────────────────
function SlideRevenue() {
  return (
    <div className="cp-slide s-generic">
      <div className="cp-label">The Business Case</div>
      <h2 className="cp-h2">Year One Revenue Projection</h2>
      <div className="s-rev-box">
        <div className="s-rev-row">
          <span className="s-rev-desc">200 mid-tier members × $50</span>
          <span className="s-rev-eq">=</span>
          <span className="s-rev-val">$10,000</span>
        </div>
        <div className="s-rev-row">
          <span className="s-rev-desc">100 premium members × $175</span>
          <span className="s-rev-eq">=</span>
          <span className="s-rev-val">$17,500</span>
        </div>
        <div className="s-rev-divider" />
        <div className="s-rev-row total">
          <span className="s-rev-desc">Recurring fee revenue</span>
          <span className="s-rev-eq">=</span>
          <span className="s-rev-val total-val">$27,500</span>
        </div>
      </div>
      <div className="s-rev-notes">
        <div className="s-rev-note">+ 25% documented lift in per-visit spend for paid members</div>
        <div className="s-rev-note">+ 5% of paid fees → Everglades / lionfish removal (earned PR)</div>
        <div className="s-rev-note">+ Premium cap creates its own marketing engine</div>
      </div>
      <div className="s-rev-footer">Before anyone orders a single beer.</div>
    </div>
  );
}

// ─── SLIDE 6: PLATFORM ────────────────────────────────────────────────────────
function SlidePlatform() {
  return (
    <div className="cp-slide s-generic">
      <div className="cp-label">The Stack</div>
      <h2 className="cp-h2">What to Build On</h2>
      <div className="s-plat-grid">
        <div className="s-plat-main">
          <div className="s-plat-tag">Recommended</div>
          <div className="s-plat-name">Arryved + TapWyse</div>
          <div className="s-plat-role">POS + Membership Layer</div>
          <div className="s-plat-cost">$300 – $600 / month</div>
          <ul className="s-plat-list">
            <li>Purpose-built for craft brewery taprooms</li>
            <li>Avg. mug-club member value: <strong>$16.90 / month</strong></li>
            <li><strong>98 visit lifts</strong> per push notification sent</li>
            <li><strong>$839K+ ARR</strong> generated across customer base</li>
            <li>Branded app, digital member card, auto-billing</li>
          </ul>
        </div>
        <div className="s-plat-side">
          <div className="s-plat-card">
            <div className="s-plat-name sm">Untappd for Business</div>
            <div className="s-plat-role">Menu + Acquisition Channel</div>
            <div className="s-plat-cost sm">$899 – $1,199 / year</div>
            <div className="s-plat-note">ISB already has 13,993 users here. Use it to broadcast releases — not to run the loyalty program.</div>
          </div>
          <div className="s-plat-card">
            <div className="s-plat-name sm">Annual Brand Budget</div>
            <div className="s-plat-cost sm">~$5,000</div>
            <div className="s-plat-note">Custom glassware, member events &amp; surprise-and-delight inventory.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE 7: THREE MOVES ─────────────────────────────────────────────────────
function SlideMoves() {
  return (
    <div className="cp-slide s-generic">
      <div className="cp-label">The Action Plan</div>
      <h2 className="cp-h2">Three Moves to Make</h2>
      <div className="s-moves">
        <div className="s-move">
          <div className="s-move-letter">A</div>
          <div className="s-move-body">
            <div className="s-move-title">Launch with the invasive-species taxonomy</div>
            <div className="s-move-text">Three tiers with ISB-native names. Cap the Apex Invader tier publicly and announce the waitlist. Pre-stamp every Curly-Tail card with 2 free stamps. Tie 5% of paid fees to Everglades conservation.</div>
          </div>
        </div>
        <div className="s-move">
          <div className="s-move-letter">B</div>
          <div className="s-move-body">
            <div className="s-move-title">Run the Florida 24 Challenge</div>
            <div className="s-move-text">Members who check in on 12 of ISB's 24 current taps per quarter earn a limited explorer patch. Hit all 24 and unlock a brewer-for-a-day experience. Converts the rotating tap list from friction into a loyalty mechanic.</div>
          </div>
        </div>
        <div className="s-move">
          <div className="s-move-letter">C</div>
          <div className="s-move-body">
            <div className="s-move-title">Own the slow nights</div>
            <div className="s-move-text">Carouser Mondays: members get a free flight with the brewer present 6–8 PM monthly. Sour Tuesdays: members vote on the next pilot batch. Builds community without abandoning the beer-nerd-first identity.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE 8: THE BET ─────────────────────────────────────────────────────────
function SlideBet() {
  return (
    <div className="cp-slide s-bet">
      <Particles />
      <div className="cp-label">The Conclusion</div>
      <blockquote className="s-bet-quote">
        "A paid, tiered, digitally-managed mug club is the highest-ROI loyalty
        structure for a craft brewery — and the most successful South Florida
        competitor is already proving it works in this exact market."
      </blockquote>
      <p className="s-bet-body">
        ISB's brand assets — the invasive-species taxonomy, the ecological mission,
        78,714 Untappd check-ins, the distilling expansion — are better than most competitors'.
      </p>
      <p className="s-bet-sub">
        Low membership numbers become status symbols. The mug on the wall becomes
        the recruitment ad. The brewery becomes a third place.
      </p>
      <div className="s-bet-cta">Let's Build It.</div>
    </div>
  );
}

// ─── SLIDES REGISTRY ──────────────────────────────────────────────────────────
const SLIDES = [
  SlideTitle,
  SlideOpportunity,
  SlideCompetition,
  SlideScience,
  SlideTiers,
  SlideRevenue,
  SlidePlatform,
  SlideMoves,
  SlideBet,
];

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function CarouserPitch() {
  const [unlocked, setUnlocked] = useState(false);
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((index) => {
    if (fading || index < 0 || index >= SLIDES.length) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 320);
  }, [fading]);

  useEffect(() => {
    if (!unlocked) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlocked, current, goTo]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const SlideComponent = SLIDES[current];
  const pct = ((current + 1) / SLIDES.length) * 100;

  return (
    <div className="cp-root">
      <div className="cp-progress" style={{ width: `${pct}%` }} />

      <div className={`cp-stage${fading ? ' fading' : ''}`}>
        <SlideComponent />
      </div>

      <nav className="cp-nav" aria-label="Slide navigation">
        <button
          className="cp-nav-btn"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          aria-label="Previous slide"
        >←</button>
        <span className="cp-nav-count">{current + 1} / {SLIDES.length}</span>
        <button
          className="cp-nav-btn"
          onClick={() => goTo(current + 1)}
          disabled={current === SLIDES.length - 1}
          aria-label="Next slide"
        >→</button>
      </nav>

      {current === 0 && (
        <div className="cp-hint" aria-hidden="true">
          Use ← → arrow keys or buttons to navigate
        </div>
      )}
    </div>
  );
}
