// CheckIn — the page customers land on after scanning the QR code.
//
// URL: /checkin?token=<TOKEN>
//
// Flow:
//   1. If not logged in → redirect to login, then back here
//   2. If logged in → call the 'checkin' edge function with the token
//   3. Show the result: success, already-checked-in, invalid token, or error

import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePassport } from './PassportContext';
import logoImg from '../assets/logo-white-new.webp';
import './passport.css';

// Possible states the check-in page can be in.
const STATE = {
  LOADING:  'loading',
  SUCCESS:  'success',
  ALREADY:  'already',  // already checked in today
  INVALID:  'invalid',  // bad / expired token
  NO_TOKEN: 'no_token', // URL has no token param
  ERROR:    'error',
};

export default function CheckIn() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, loading: authLoading } = usePassport();

  const [state,    setState]    = useState(STATE.LOADING);
  const [result,   setResult]   = useState(null); // response from edge function
  const [errorMsg, setErrorMsg] = useState('');

  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    // Wait for the auth session to resolve before doing anything.
    if (authLoading) return;

    if (!token) {
      setState(STATE.NO_TOKEN);
      return;
    }

    if (!user) {
      // Not logged in: send to login, preserve the full check-in URL so we
      // can return here automatically after auth.
      navigate('/passport/login', {
        state: { from: location },
        replace: true,
      });
      return;
    }

    // User is authenticated — attempt the check-in.
    doCheckIn();
  }, [authLoading, user]);

  const doCheckIn = async () => {
    setState(STATE.LOADING);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/checkin`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setState(STATE.SUCCESS);
      } else if (res.status === 409 || data.code === 'already_checked_in') {
        setState(STATE.ALREADY);
      } else if (data.code === 'invalid_token' || data.code === 'expired_token') {
        setErrorMsg(data.error);
        setState(STATE.INVALID);
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setState(STATE.ERROR);
      }
    } catch (err) {
      setErrorMsg('Network error. Make sure you have internet access.');
      setState(STATE.ERROR);
    }
  };

  // ── Render states ──────────────────────────────────────────────────────

  if (state === STATE.LOADING) {
    return (
      <div className="pp-checkin">
        <div className="pp-checkin__card">
          <img src={logoImg} alt="Invasive Species Brewing" className="pp-checkin__logo" />
          <div className="pp-spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#555', fontSize: '0.9rem' }}>Verifying your visit…</p>
        </div>
      </div>
    );
  }

  if (state === STATE.NO_TOKEN) {
    return (
      <div className="pp-checkin">
        <div className="pp-checkin__card pp-checkin__card--error">
          <img src={logoImg} alt="Invasive Species Brewing" className="pp-checkin__logo" />
          <span className="pp-checkin__icon">🤔</span>
          <h1 className="pp-checkin__title">Missing check-in code</h1>
          <p className="pp-checkin__sub">
            This link is missing a check-in token. Scan the QR code posted in the taproom to check in.
          </p>
          <Link to="/passport/profile" className="pp-btn pp-btn--outline" style={{ marginTop: '1rem' }}>
            View My Passport
          </Link>
        </div>
      </div>
    );
  }

  if (state === STATE.SUCCESS) {
    const { totalVisits, firstName, newlyUnlocked = [], nextReward, visitsToNext } = result;
    return (
      <div className="pp-checkin">
        <div className="pp-checkin__card pp-checkin__card--success">
          <img src={logoImg} alt="Invasive Species Brewing" className="pp-checkin__logo" />
          <span className="pp-checkin__icon">🍺</span>
          <h1 className="pp-checkin__title" style={{ color: '#39FF14' }}>Visit verified!</h1>
          <p className="pp-checkin__sub">Welcome in, {firstName}. Enjoy your beer.</p>

          <div className="pp-checkin__visits-badge">
            <span className="pp-checkin__visits-num">{totalVisits}</span>
            <span className="pp-checkin__visits-label">Total Visits</span>
          </div>

          {/* Reward unlocked pop */}
          {newlyUnlocked.length > 0 && (
            <div className="pp-checkin__reward-pop" style={{ animation: 'pp-stamp-pulse 2s ease-in-out' }}>
              <h4>🎉 New reward unlocked!</h4>
              {newlyUnlocked.map(r => (
                <p key={r.id}>{r.name}</p>
              ))}
              <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.25rem' }}>
                Show your passport to a bartender to redeem.
              </p>
            </div>
          )}

          {/* Progress toward next reward */}
          {nextReward && !newlyUnlocked.length && (
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.75rem 0 0' }}>
              Your next reward is only{' '}
              <strong style={{ color: '#f0f0f0' }}>{visitsToNext} visit{visitsToNext !== 1 ? 's' : ''} away</strong>.
              Keep coming back! 🤙
            </p>
          )}

          {!nextReward && (
            <p style={{ fontSize: '0.85rem', color: '#39FF14', margin: '0.75rem 0 0', fontWeight: 600 }}>
              You've unlocked all rewards! You're basically a local legend. 🏆
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            <Link to="/passport/profile" className="pp-btn pp-btn--primary pp-btn--sm">
              View My Passport
            </Link>
            <Link to="/" className="pp-btn pp-btn--ghost pp-btn--sm">
              Back to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === STATE.ALREADY) {
    return (
      <div className="pp-checkin">
        <div className="pp-checkin__card pp-checkin__card--already">
          <img src={logoImg} alt="Invasive Species Brewing" className="pp-checkin__logo" />
          <span className="pp-checkin__icon">⏰</span>
          <h1 className="pp-checkin__title" style={{ color: '#f0a500' }}>Already checked in today</h1>
          <p className="pp-checkin__sub">
            You've already earned your visit for today. Come back tomorrow for another stamp!
          </p>
          <Link to="/passport/profile" className="pp-btn pp-btn--outline" style={{ marginTop: '1rem', borderColor: '#f0a500', color: '#f0a500' }}>
            View My Passport
          </Link>
        </div>
      </div>
    );
  }

  if (state === STATE.INVALID) {
    return (
      <div className="pp-checkin">
        <div className="pp-checkin__card pp-checkin__card--error">
          <img src={logoImg} alt="Invasive Species Brewing" className="pp-checkin__logo" />
          <span className="pp-checkin__icon">⛔</span>
          <h1 className="pp-checkin__title">Link expired</h1>
          <p className="pp-checkin__sub">
            {errorMsg || 'This check-in link is no longer active.'}
          </p>
          <p style={{ fontSize: '0.82rem', color: '#555', marginTop: '0.5rem' }}>
            Ask a staff member for the current QR code — they rotate daily.
          </p>
          <Link to="/passport/profile" className="pp-btn pp-btn--outline pp-btn--sm" style={{ marginTop: '1rem' }}>
            View My Passport
          </Link>
        </div>
      </div>
    );
  }

  // STATE.ERROR fallback
  return (
    <div className="pp-checkin">
      <div className="pp-checkin__card pp-checkin__card--error">
        <img src={logoImg} alt="Invasive Species Brewing" className="pp-checkin__logo" />
        <span className="pp-checkin__icon">😬</span>
        <h1 className="pp-checkin__title">Something went wrong</h1>
        <p className="pp-checkin__sub">{errorMsg}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button
            className="pp-btn pp-btn--outline pp-btn--sm"
            onClick={doCheckIn}
          >
            Try Again
          </button>
          <Link to="/passport/profile" className="pp-btn pp-btn--ghost pp-btn--sm">
            View Passport
          </Link>
        </div>
      </div>
    </div>
  );
}
