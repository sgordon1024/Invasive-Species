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

// Turns whatever Phil pastes in the "image" cell into a usable <img> src.
// Handles Google Drive share links (the easy path — upload to Drive, share,
// paste the link) as well as plain direct image URLs.
function resolveImageUrl(raw) {
  if (!raw) return null;
  const url = raw.trim();
  // Pull a Drive file ID out of the common share-link shapes:
  //   .../file/d/FILE_ID/view   ·   ?id=FILE_ID   ·   /d/FILE_ID
  const driveMatch = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/) || url.match(/\/d\/([^/?]+)/);
  if (driveMatch && url.includes('google.com')) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  // Otherwise assume it's already a direct image URL.
  return url;
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

  // Use the sheet's image if Phil set one, otherwise the bundled default.
  const heroSrc = resolveImageUrl(event?.image) || dinnerHeroImg;

  return (
    <section className="dinner-section">

      {/* ── HERO IMAGE ── */}
      <div className="dinner-hero-img-wrap">
        <img
          src={heroSrc}
          alt=""
          className="dinner-hero-img"
          aria-hidden="true"
          onError={(e) => { e.currentTarget.src = dinnerHeroImg; }}
        />
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
