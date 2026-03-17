// PassportProfile — the logged-in user's dashboard.
// Shows current-season visit count, progress toward milestones, and reward status.
// Season = calendar year (Jan 1 – Dec 31). Resets automatically each year.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePassport } from './PassportContext';
import './passport.css';

const CURRENT_YEAR = new Date().getFullYear();
const SEASON_START = `${CURRENT_YEAR}-01-01T00:00:00`;

export default function PassportProfile() {
  const { user, profile, signOut } = usePassport();

  const [rewards,      setRewards]      = useState([]);
  const [redemptions,  setRedemptions]  = useState([]);
  const [checkIns,     setCheckIns]     = useState([]);
  const [seasonVisits, setSeasonVisits] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);

    const [
      { data: rw },
      { data: rd },
      { data: ci },
      { count: sv },
    ] = await Promise.all([
      supabase.from('rewards').select('*').eq('is_active', true).order('visit_threshold'),
      supabase.from('redemptions').select('*').eq('member_id', user.id),
      supabase.from('check_ins')
        .select('*')
        .eq('member_id', user.id)
        .eq('is_valid', true)
        .order('checked_in_at', { ascending: false })
        .limit(10),
      // Count only this season's (current year's) valid check-ins.
      supabase.from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', user.id)
        .eq('is_valid', true)
        .gte('checked_in_at', SEASON_START),
    ]);

    setRewards(rw ?? []);
    setRedemptions(rd ?? []);
    setCheckIns(ci ?? []);
    setSeasonVisits(sv ?? 0);
    setLoading(false);
  };

  if (!profile) return null;

  const visits      = seasonVisits;
  const redeemedIds = new Set(redemptions.map(r => r.reward_id));

  const nextReward = rewards.find(r => visits < r.visit_threshold);

  const prevThreshold = (() => {
    const earned = rewards.filter(r => visits >= r.visit_threshold);
    return earned.length ? earned[earned.length - 1].visit_threshold : 0;
  })();

  const segmentMax = nextReward ? nextReward.visit_threshold : Math.max(visits, 1);
  const segmentPct = nextReward
    ? Math.min(100, ((visits - prevThreshold) / (segmentMax - prevThreshold)) * 100)
    : 100;

  const maxThreshold = rewards.length ? rewards[rewards.length - 1].visit_threshold : 100;

  return (
    <div className="pp-page">
      <div className="pp-profile">
        <div className="pp-container">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="pp-profile__header">
            <div>
              <p className="pp-profile__welcome">Welcome back,</p>
              <h1 className="pp-profile__name">{profile.first_name} 👋</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="pp-member-badge">
                🪪 <span>Passport</span>
                <span className="pp-member-badge__id">{profile.member_id}</span>
              </div>
              <button onClick={signOut} className="pp-btn pp-btn--ghost pp-btn--sm">
                Sign Out
              </button>
            </div>
          </div>


          {/* ── Season banner ───────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#080808',
            border: '1px solid #1a1a1a',
            borderRadius: 10,
            padding: '0.6rem 1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '0.8rem', color: '#555' }}>
              🗓 <strong style={{ color: '#888' }}>{CURRENT_YEAR} Season</strong>
              {' '}— visits reset January 1st each year
            </span>
            <span style={{ fontSize: '0.75rem', color: '#39FF14', fontWeight: 600 }}>
              {visits} / 100 visits
            </span>
          </div>


          {/* ── Visit counter ───────────────────────────────────────── */}
          <div className="pp-visits">
            <div>
              <div className="pp-visits__count">{visits}</div>
              <div className="pp-visits__label">{CURRENT_YEAR} Visits</div>
            </div>
            <div className="pp-visits__next">
              {nextReward ? (
                <>
                  Your next reward is only{' '}
                  <strong>{nextReward.visit_threshold - visits} visit{nextReward.visit_threshold - visits !== 1 ? 's' : ''} away</strong>.
                  <br />
                  <span style={{ color: '#555', fontSize: '0.85rem' }}>
                    Keep showing up. 🍺
                  </span>
                </>
              ) : (
                <strong style={{ color: '#39FF14' }}>
                  Invasive Legend status achieved. You are the bar. 🏆
                </strong>
              )}
            </div>
          </div>


          {/* ── Progress bar ────────────────────────────────────────── */}
          {loading ? (
            <div style={{ height: 60 }} />
          ) : (
            <div className="pp-progress-wrap">
              <div className="pp-progress-label">
                <span>{prevThreshold} visits</span>
                <span>{nextReward ? `Next: ${nextReward.name} at ${nextReward.visit_threshold}` : 'All unlocked!'}</span>
              </div>
              <div className="pp-progress-track">
                <div className="pp-progress-fill" style={{ width: `${segmentPct}%` }} />
              </div>

              {/* Milestone dots — spaced across the full 0–100 track */}
              <div className="pp-milestones" style={{ marginTop: '0.75rem' }}>
                {rewards.map(r => {
                  const pos      = (r.visit_threshold / maxThreshold) * 100;
                  const unlocked = visits >= r.visit_threshold;
                  return (
                    <div
                      key={r.id}
                      className="pp-milestone"
                      style={{ left: `${pos}%` }}
                      title={`${r.visit_threshold} visits — ${r.name}`}
                    >
                      <div className={`pp-milestone__dot ${unlocked ? 'pp-milestone__dot--unlocked' : ''}`} />
                      <span className={`pp-milestone__label ${unlocked ? 'pp-milestone__label--unlocked' : ''}`}>
                        {r.visit_threshold}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* ── Rewards ─────────────────────────────────────────────── */}
          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#f0f0f0' }}>
              {CURRENT_YEAR} Rewards
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#555', margin: '0 0 1.25rem' }}>
              Show your passport to a bartender to redeem any earned reward. Rewards reset January 1st.
            </p>

            {loading ? (
              <div className="pp-spinner" style={{ margin: '2rem auto' }} />
            ) : (
              <div className="pp-reward-tiles">
                {rewards.map(r => {
                  const unlocked = visits >= r.visit_threshold;
                  const redeemed = redeemedIds.has(r.id);
                  const cls = redeemed
                    ? 'pp-reward-tile--redeemed'
                    : unlocked
                      ? 'pp-reward-tile--unlocked'
                      : 'pp-reward-tile--locked';

                  return (
                    <div key={r.id} className={`pp-reward-tile ${cls}`}>
                      <div className="pp-reward-tile__threshold">
                        {unlocked ? '✓' : '🔒'} {r.visit_threshold} visits
                      </div>
                      <p className="pp-reward-tile__name">{r.name}</p>
                      <p className="pp-reward-tile__desc">{r.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* ── Recent visits ───────────────────────────────────────── */}
          {!loading && checkIns.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem', color: '#f0f0f0' }}>
                Recent Visits
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {checkIns.map((ci, i) => (
                  <div
                    key={ci.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0',
                      borderBottom: '1px solid #0d0d0d',
                      fontSize: '0.85rem',
                      color: '#555',
                    }}
                  >
                    <span>
                      <span style={{ color: '#39FF14', marginRight: '0.5rem' }}>✓</span>
                      Visit #{visits - i}
                    </span>
                    <span>{formatDate(ci.checked_in_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* ── Quick actions ────────────────────────────────────────── */}
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/passport" className="pp-btn pp-btn--ghost pp-btn--sm">
              ← Passport Home
            </Link>
            <Link to="/" className="pp-btn pp-btn--ghost pp-btn--sm">
              Back to Taproom
            </Link>
          </div>

        </div>
      </div>

      {toast && (
        <div className="pp-toast">
          <span className="pp-toast__icon">{toast.icon}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
