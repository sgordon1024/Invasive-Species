import { useState } from 'react';
import { supabase, supabaseReady } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
    // On success, AuthContext picks up the session and the router swaps in the app.
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="login-mark">IS</span>
          <div>
            <h1 className="login-title">Invasive Ops</h1>
            <p className="login-sub">Sales &amp; Inventory</p>
          </div>
        </div>

        {!supabaseReady && (
          <p className="login-error">
            Supabase isn’t configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.
          </p>
        )}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="btn btn-accent btn-block" disabled={busy || !supabaseReady}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="login-note">
          Team accounts are created by an admin in the Supabase dashboard.
        </p>
      </form>
    </div>
  );
}
