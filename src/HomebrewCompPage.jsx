import { useState } from 'react';
import { Link } from 'react-router-dom';
import HomebrewComp from './HomebrewComp';
import NavCarouserButton from './NavCarouserButton';
import logoImg from './assets/logo-white-new.webp';
import './ScrollStop.css';

export default function HomebrewCompPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>

      {/* ── Nav ── */}
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
            <li><Link to="/#photos">Photos</Link></li>
            <li><Link to="/#press">Press</Link></li>
            <li><NavCarouserButton /></li>
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

        {menuOpen && <div className="nav-drawer-overlay" onClick={() => setMenuOpen(false)} />}
        <div id="mobile-nav-drawer" className={`nav-drawer ${menuOpen ? 'nav-drawer-open' : ''}`} aria-label="Mobile navigation">
          <button className="nav-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu">✕</button>
          <ul className="nav-drawer-links">
            {[['/#story','About'],['/#menu','Menu'],['/#food-trucks','Food Trucks'],['/#visit','Visit'],['/#photos','Photos'],['/#press','Press']].map(([href, label]) => (
              <li key={href}><Link to={href} onClick={() => setMenuOpen(false)}>{label}</Link></li>
            ))}
            <li><NavCarouserButton onClick={() => setMenuOpen(false)} /></li>
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

      <div style={{ paddingTop: '80px' }}>
        <HomebrewComp />
      </div>

    </div>
  );
}
