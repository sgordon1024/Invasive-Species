// ShopPage — standalone page wrapper for the Brew Shop.
// Accessible at /shop via React Router.

import { Link } from 'react-router-dom';
import Shop from './Shop';
import logoImg from './assets/logo-white-new.webp';

export default function ShopPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── Minimal nav ─────────────────────────────────────────── */}
      <header>
        <nav className="site-nav" aria-label="Main navigation">
          <Link to="/">
            <img src={logoImg} alt="Invasive Species Brewing" className="nav-logo" style={{ filter: 'invert(1)' }} />
          </Link>
          <ul className="nav-links">
            <li><Link to="/#story">About</Link></li>
            <li><Link to="/#menu">Menu</Link></li>
            <li><Link to="/#food-trucks">Food Trucks</Link></li>
            <li><Link to="/#visit">Visit</Link></li>
            <li><Link to="/#photos">Photos</Link></li>
            <li><Link to="/#press">Press</Link></li>
            <li><Link to="/passport" className="nav-cta" style={{ background: 'rgba(57,255,20,0.12)', color: '#39FF14', border: '1px solid rgba(57,255,20,0.3)' }}>Beer Passport</Link></li>
          </ul>
        </nav>
      </header>

      {/* ── Shop content ────────────────────────────────────────── */}
      <div style={{ paddingTop: '80px' }}>
        <Shop />
      </div>

    </div>
  );
}
