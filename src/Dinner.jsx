import dinnerHeroImg from './assets/dinner-hero.webp';
import './Dinner.css';

// NOTE: The full sheet-driven dinner event page is preserved in git history
// (branch claude/dinner-events). This is a temporary "coming soon" placeholder
// until the next dinner is ready to announce.
export default function Dinner() {
  return (
    <section className="dinner-coming-soon" style={{ backgroundImage: `url(${dinnerHeroImg})` }}>
      <div className="dinner-coming-soon-overlay" />
      <div className="dinner-coming-soon-content">
        <p className="dinner-eyebrow">Beer &amp; Cocktail Dinners</p>
        <h1 className="dinner-coming-soon-title">Coming Soon</h1>
        <p className="dinner-coming-soon-sub">
          We&apos;re cooking up something special — limited-seating beer and cocktail
          dinners are on the way. Check back soon for dates and tickets.
        </p>
      </div>
    </section>
  );
}
