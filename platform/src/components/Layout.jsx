import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', end: true, icon: '◧' },
  { to: '/sales', label: 'Sales', icon: '＄' },
  { to: '/inventory', label: 'Inventory', icon: '▥' },
  { to: '/products', label: 'Products', icon: '⛾' },
];

export default function Layout({ children }) {
  const { user, signOut } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-mark">IS</span>
          <div className="sidebar-brand-text">
            <strong>Invasive Ops</strong>
            <span>Sales &amp; Inventory</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, label, end, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
            >
              <span className="sidebar-icon" aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-user" title={user?.email}>{user?.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
