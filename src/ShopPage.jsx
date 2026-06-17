// ShopPage — standalone page wrapper for the Brew Shop.
// Accessible at /shop via React Router.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Shop from './Shop';
import logoImg from './assets/logo-white-new.webp';

export default function ShopPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header>
        <nav className="site-nav" aria-label="Main navigation">
          <Link to="/">
            <img src={logoImg} alt="Invasive Species Brewing" className="nav-logo" />
          </Link>
          <ul className="nav-links">
            <li><Link to="/#story">About</Link></li>
            <li><Link to="/#menu">Menu</Link></li>
            <li><Link to="/#food-trucks">Food Trucks</Link></li>
            <li><Link to="/#visit">Visit</Link></li>
            <li><Link to="/passport" className="nav-cta" style={{ background: 'rgba(57,255,20,0.12)', color: '#39FF14', border: '1px solid rgba(57,255,20,0.3)' }}>Beer Passport</Link></li>
          </ul>
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span /><span /><span />
          </button>
        </nav>

        {/* ── Mobile drawer ── */}
        {menuOpen && <div className="nav-drawer-overlay" onClick={() => setMenuOpen(false)} />}
        <div id="mobile-nav-drawer" className={`nav-drawer ${menuOpen ? 'nav-drawer-open' : ''}`} aria-label="Mobile navigation">
          <button className="nav-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu">✕</button>
          <ul className="nav-drawer-links">
            {[['/#story','About'],['/#menu','Menu'],['/#food-trucks','Food Trucks'],['/#visit','Visit']].map(([href, label]) => (
              <li key={href}><Link to={href} onClick={() => setMenuOpen(false)}>{label}</Link></li>
            ))}
            <li><Link to="/passport" className="nav-cta" onClick={() => setMenuOpen(false)}>Beer Passport</Link></li>
          </ul>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Invasive+Species+Brewing,726+NE+2nd+Ave,Fort+Lauderdale,FL+33304"
            target="_blank"
            rel="noreferrer"
            className="nav-drawer-directions"
            onClick={() => setMenuOpen(false)}
          >
            Get Directions
          </a>
        </div>
      </header>

      {/* ── Shop content ────────────────────────────────────────── */}
      <div style={{ paddingTop: '80px' }}>
        <Shop />
      </div>

    </div>
  );
}
