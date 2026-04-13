// PassportAuth — login and signup on a single page with two tabs.
// After successful auth, redirects to /passport/profile
// (or the "from" location if the user was sent here from a protected route).

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { usePassport } from './PassportContext';
import logoImg from '../assets/logo-white-new.webp';
import './passport.css';

export default function PassportAuth() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, signIn, signUp } = usePassport();

  // Default tab can be forced via ?tab=signup in the URL (from landing page CTAs).
  const defaultTab = new URLSearchParams(location.search).get('tab') === 'signup'
    ? 'signup'
    : 'login';

  const [tab,       setTab]       = useState(defaultTab);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass,  setLoginPass]  = useState('');

  // Redirect if already logged in.
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname ?? '/passport/profile';
      navigate(from, { replace: true });
    }
  }, [user]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Sign up ────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!firstName.trim()) return setError('First name is required.');
    if (!email.trim())     return setError('Email is required.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await signUp({ firstName: firstName.trim(), email: email.trim().toLowerCase(), phone, password });
      setSuccess('Account created! Check your email to confirm, then log in below.');
      setTab('login');
      setLoginEmail(email.trim().toLowerCase());
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Log in ─────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!loginEmail.trim() || !loginPass) return setError('Email and password are required.');

    setLoading(true);
    try {
      await signIn({ email: loginEmail.trim().toLowerCase(), password: loginPass });
      // Redirect happens via the useEffect above once the session updates.
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp-page">
      <div className="pp-auth">
        <div className="pp-container--narrow">

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src={logoImg} alt="Invasive Species Brewing" style={{ height: 52, opacity: 0.85, filter: 'invert(1)' }} />
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Beer Passport
            </p>
          </div>

          <div className="pp-auth__card">

            {/* Tabs */}
            <div className="pp-auth__tabs">
              <button
                className={`pp-auth__tab ${tab === 'login' ? 'pp-auth__tab--active' : ''}`}
                onClick={() => { setTab('login'); clearMessages(); }}
              >
                Sign In
              </button>
              <button
                className={`pp-auth__tab ${tab === 'signup' ? 'pp-auth__tab--active' : ''}`}
                onClick={() => { setTab('signup'); clearMessages(); }}
              >
                Join Free
              </button>
            </div>

            {/* Error / success messages */}
            {error   && <div className="pp-form-error">{error}</div>}
            {success && <div className="pp-form-success">{success}</div>}

            {/* ── Login form ──────────────────────────────────────────── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} noValidate>
                <div className="pp-form-group">
                  <label className="pp-label" htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="pp-input"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="pp-form-group">
                  <label className="pp-label" htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    className="pp-input"
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="pp-btn pp-btn--primary pp-btn--full"
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>

                <div className="pp-auth__footer" style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => handlePasswordReset(loginEmail)}
                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            )}

            {/* ── Signup form ─────────────────────────────────────────── */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} noValidate>
                <div className="pp-form-group">
                  <label className="pp-label" htmlFor="signup-name">First Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    className="pp-input"
                    placeholder="Alex"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    required
                  />
                </div>

                <div className="pp-form-group">
                  <label className="pp-label" htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    className="pp-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="pp-form-group">
                  <label className="pp-label" htmlFor="signup-phone">
                    Phone <span style={{ color: '#444', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="signup-phone"
                    type="tel"
                    className="pp-input"
                    placeholder="954-555-0100"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                  <span className="pp-input-hint">Only used so staff can look you up if needed.</span>
                </div>

                <div className="pp-form-group">
                  <label className="pp-label" htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    className="pp-input"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>

                <div className="pp-form-group">
                  <label className="pp-label" htmlFor="signup-confirm">Confirm Password</label>
                  <input
                    id="signup-confirm"
                    type="password"
                    className="pp-input"
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="pp-btn pp-btn--primary pp-btn--full"
                  disabled={loading}
                >
                  {loading ? 'Creating passport…' : 'Create My Passport'}
                </button>

                <p style={{ fontSize: '0.75rem', color: '#444', textAlign: 'center', marginTop: '0.75rem', lineHeight: '1.5' }}>
                  By signing up you agree that you are 21+ and accept our humble house rules.
                </p>
              </form>
            )}
          </div>

          {/* Back to main site */}
          <div className="pp-auth__footer" style={{ marginTop: '1.5rem' }}>
            <Link to="/">← Back to Invasive Species Brewing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trigger Supabase password reset email.
// Imported inline to keep the file self-contained.
async function handlePasswordReset(email) {
  if (!email) {
    alert('Enter your email address first, then click "Forgot password?"');
    return;
  }
  const { supabase } = await import('../lib/supabase');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/passport/reset-password`,
  });
  if (error) {
    alert('Could not send reset email: ' + error.message);
  } else {
    alert('Check your email for a password reset link.');
  }
}
