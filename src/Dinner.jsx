import { useEffect, useState } from 'react';
import dinnerHeroImg from './assets/dinner-hero.webp';
import './Dinner.css';

// Parses the Google Sheet (key | value rows) into a plain object.
// Phil edits Column A (key) and Column B (value) in the sheet.
function parseSheet(csv) {
  const data = {};
  csv.trim().split('\n').forEach(line => {
    const comma = line.indexOf(',');
    if (comma === -1) return;
    const key = line.slice(0, comma).trim().replace(/^"|"$/g, '');
    const val = line.slice(comma + 1).trim().replace(/^"|"$/g, '');
    if (key) data[key] = val;
  });
  return data;
}

export default function Dinner() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = import.meta.env.VITE_DINNER_SHEET_URL;
    if (!url) { setLoading(false); return; }

    fetch(url)
      .then(r => r.text())
      .then(csv => { setEvent(parseSheet(csv)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="dinner-loading">Loading…</div>;
  }

  // Courses are pipe-separated in the sheet: "Course 1 | Course 2 | ..."
  const courses = event?.menu
    ? event.menu.split('|').map(c => c.trim()).filter(Boolean)
    : [];

  return (
    <section className="dinner-section">

      {/* ── HERO IMAGE ── */}
      <div className="dinner-hero-img-wrap">
        <img src={dinnerHeroImg} alt="" className="dinner-hero-img" aria-hidden="true" />
      </div>

      {/* ── HERO ── */}
      <div className="dinner-hero">
        <p className="dinner-eyebrow">Limited Seating Event</p>
        <h1 className="dinner-title">{event?.title || 'Beer & Cocktail Dinner'}</h1>
        {event?.subtitle && (
          <p className="dinner-subtitle">{event.subtitle}</p>
        )}
      </div>

      {/* ── META CARDS ── */}
      <div className="dinner-meta">
        {event?.date && (
          <div className="dinner-meta-card">
            <div className="dinner-meta-label">Date</div>
            <div className="dinner-meta-value accent">{event.date}</div>
          </div>
        )}
        {event?.time && (
          <div className="dinner-meta-card">
            <div className="dinner-meta-label">Time</div>
            <div className="dinner-meta-value">{event.time}</div>
          </div>
        )}
        {event?.price && (
          <div className="dinner-meta-card">
            <div className="dinner-meta-label">Price</div>
            <div className="dinner-meta-value">{event.price}</div>
          </div>
        )}
        {event?.seats && (
          <div className="dinner-meta-card">
            <div className="dinner-meta-label">Seating</div>
            <div className="dinner-meta-value">{event.seats}</div>
          </div>
        )}
      </div>

      <hr className="dinner-divider" />

      {/* ── BODY ── */}
      <div className="dinner-body">
        {event?.description && (
          <p className="dinner-description">{event.description}</p>
        )}

        {courses.length > 0 && (
          <>
            <p className="dinner-menu-heading">The Menu</p>
            <div className="dinner-menu-courses">
              {courses.map((course, i) => (
                <div key={i} className="dinner-course">{course}</div>
              ))}
            </div>
          </>
        )}

        {/* ── CTA ── */}
        {event?.paylink && (
          <div className="dinner-cta">
            <a
              href={event.paylink}
              className="dinner-cta-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reserve Your Seat →
            </a>
            <p className="dinner-cta-note">Secure checkout via Stripe · Seats are limited</p>
          </div>
        )}
      </div>

    </section>
  );
}
