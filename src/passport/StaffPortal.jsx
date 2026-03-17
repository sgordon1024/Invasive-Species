// StaffPortal — staff-only page for managing Beer Passport redemptions.
//
// Features:
//   - Generate / display current QR token + printable QR code
//   - Search members by email, phone, or member ID
//   - View member visit count and reward status
//   - Mark rewards as redeemed (calls the redeem-reward edge function)
//
// Access: protected by ProtectedRoute with requireStaff=true

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePassport } from './PassportContext';
import './passport.css';

export default function StaffPortal() {
  const { user, profile, signOut } = usePassport();

  // QR token state
  const [qrLoading,    setQrLoading]    = useState(false);
  const [currentToken, setCurrentToken] = useState(null); // { token, expiresAt, qrImageUrl, checkInUrl }

  // Member search state
  const [query,      setQuery]      = useState('');
  const [searching,  setSearching]  = useState(false);
  const [member,     setMember]     = useState(null);
  const [rewards,    setRewards]    = useState([]);
  const [redemptions,setRedemptions]= useState([]);
  const [notFound,   setNotFound]   = useState(false);

  // Redemption state
  const [redeeming, setRedeeming]   = useState(null); // reward id being processed
  const [redeemMsg, setRedeemMsg]   = useState('');

  // Load rewards config once.
  useEffect(() => {
    supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('visit_threshold')
      .then(({ data }) => setRewards(data ?? []));
  }, []);

  // ── Generate QR token ────────────────────────────────────────────────
  const generateToken = async () => {
    setQrLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-token`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({ validHours: 20 }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate token');
      setCurrentToken(data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setQrLoading(false);
    }
  };

  // ── Search for a member ─────────────────────────────────────────────
  const searchMember = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setMember(null);
    setNotFound(false);
    setRedemptions([]);
    setRedeemMsg('');

    try {
      // Use the get_member_for_staff RPC (defined in the migration).
      const { data, error } = await supabase.rpc('get_member_for_staff', {
        p_query: query.trim(),
      });
      if (error) throw error;

      if (!data || data.length === 0) {
        setNotFound(true);
      } else {
        const m = data[0];
        setMember(m);

        // Load this member's redemptions.
        const { data: rd } = await supabase
          .from('redemptions')
          .select('*')
          .eq('member_id', m.id);
        setRedemptions(rd ?? []);
      }
    } catch (err) {
      alert('Search error: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  // ── Redeem a reward ─────────────────────────────────────────────────
  const redeemReward = async (rewardId) => {
    if (!member) return;
    if (!window.confirm('Mark this reward as redeemed? This cannot be undone.')) return;

    setRedeeming(rewardId);
    setRedeemMsg('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-reward`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({ memberId: member.id, rewardId }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Redemption failed');

      // Refresh the redemptions list.
      const { data: rd } = await supabase
        .from('redemptions')
        .select('*')
        .eq('member_id', member.id);
      setRedemptions(rd ?? []);
      setRedeemMsg(`✅ "${data.rewardName}" marked as redeemed for ${data.member.firstName}.`);
    } catch (err) {
      setRedeemMsg(`❌ ${err.message}`);
    } finally {
      setRedeeming(null);
    }
  };

  // Derive reward status for the found member.
  const redeemedIds   = new Set(redemptions.map(r => r.reward_id));
  const memberVisits  = member?.total_visits ?? 0;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="pp-page">
      <div className="pp-staff">
        <div className="pp-container">

          {/* ── Header ───────────────────────────────────────────── */}
          <div className="pp-staff__header">
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                Staff Portal
              </h1>
              <p style={{ fontSize: '0.82rem', color: '#555', margin: '0.25rem 0 0' }}>
                Signed in as {profile?.email ?? user?.email}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="pp-staff__badge">⚙️ Staff</span>
              <button onClick={signOut} className="pp-btn pp-btn--ghost pp-btn--sm">
                Sign Out
              </button>
            </div>
          </div>


          {/* ── QR Token Panel ───────────────────────────────────── */}
          <div className="pp-qr-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                  Today's Check-In QR
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#555', margin: 0 }}>
                  Display or print this at the brewery. Rotates daily.
                </p>
              </div>
              <button
                className="pp-btn pp-btn--primary pp-btn--sm"
                onClick={generateToken}
                disabled={qrLoading}
              >
                {qrLoading ? 'Generating…' : currentToken ? '↻ Rotate Token' : 'Generate QR Code'}
              </button>
            </div>

            {currentToken ? (
              <div className="pp-qr-panel__grid">
                <div>
                  {/* QR image from free public generator — no client library needed */}
                  <img
                    src={currentToken.qrImageUrl}
                    alt="Check-in QR code"
                    className="pp-qr-panel__img"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.3rem' }}>
                      Status
                    </p>
                    <span className="pp-qr-panel__status pp-qr-panel__status--active">
                      ● Active
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.3rem' }}>
                      Expires
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#f0f0f0', margin: 0 }}>
                      {new Date(currentToken.expiresAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.3rem' }}>
                      Check-in URL
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {currentToken.checkInUrl}
                    </p>
                  </div>

                  <button
                    className="pp-btn pp-btn--outline pp-btn--sm"
                    onClick={() => window.open(currentToken.qrImageUrl, '_blank')}
                  >
                    Open Full Size ↗
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#333' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  No active QR code. Click "Generate QR Code" to create today's token.
                </p>
              </div>
            )}
          </div>


          {/* ── Member Search ────────────────────────────────────── */}
          <div className="pp-search">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
              Look Up a Member
            </h2>
            <form onSubmit={searchMember} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="pp-input"
                placeholder="Email, phone, or member ID (ISB-XXXXX)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ flex: 1, minWidth: 240 }}
              />
              <button
                type="submit"
                className="pp-btn pp-btn--primary pp-btn--sm"
                disabled={searching || !query.trim()}
              >
                {searching ? 'Searching…' : 'Search'}
              </button>
            </form>
          </div>

          {/* Search result */}
          {notFound && (
            <p style={{ color: '#555', fontSize: '0.9rem', padding: '1rem 0' }}>
              No member found for "{query}".
            </p>
          )}

          {member && (
            <div className="pp-member-result">
              {/* Member header */}
              <div className="pp-member-result__top">
                <div>
                  <h3 className="pp-member-result__name">{member.first_name}</h3>
                  <p className="pp-member-result__meta">
                    {member.email}
                    {member.phone ? ` · ${member.phone}` : ''}
                    {' · '}<span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#39FF14' }}>{member.member_id}</span>
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#444' }}>
                    Member since {new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#39FF14', lineHeight: 1 }}>
                    {memberVisits}
                  </div>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555' }}>
                    Visits
                  </div>
                </div>
              </div>

              {/* Redemption feedback message */}
              {redeemMsg && (
                <div
                  className={redeemMsg.startsWith('✅') ? 'pp-form-success' : 'pp-form-error'}
                  style={{ marginBottom: '1rem' }}
                >
                  {redeemMsg}
                </div>
              )}

              {/* Reward rows */}
              <div>
                <p style={{ fontSize: '0.78rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem', fontWeight: 600 }}>
                  Rewards
                </p>

                {rewards.length === 0 && (
                  <p style={{ color: '#444', fontSize: '0.85rem' }}>No rewards configured.</p>
                )}

                {rewards.map(r => {
                  const earned   = memberVisits >= r.visit_threshold;
                  const redeemed = redeemedIds.has(r.id);

                  return (
                    <div key={r.id} className="pp-reward-row">
                      <div className="pp-reward-row__info">
                        <p className="pp-reward-row__name">{r.name}</p>
                        <p className="pp-reward-row__desc">
                          {r.description} &mdash; requires {r.visit_threshold} visits
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {redeemed ? (
                          <span className="pp-reward-row__status pp-reward-row__status--redeemed">
                            Redeemed
                          </span>
                        ) : earned ? (
                          <>
                            <span className="pp-reward-row__status pp-reward-row__status--earned">
                              ✓ Earned
                            </span>
                            <button
                              className="pp-btn pp-btn--primary pp-btn--sm"
                              disabled={redeeming === r.id}
                              onClick={() => redeemReward(r.id)}
                            >
                              {redeeming === r.id ? 'Redeeming…' : 'Redeem'}
                            </button>
                          </>
                        ) : (
                          <span className="pp-reward-row__status pp-reward-row__status--locked">
                            {r.visit_threshold - memberVisits} visits to go
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* ── Footer nav ──────────────────────────────────────── */}
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #111', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/passport" className="pp-btn pp-btn--ghost pp-btn--sm">
              ← Passport Home
            </Link>
            <Link to="/" className="pp-btn pp-btn--ghost pp-btn--sm">
              Main Site
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
