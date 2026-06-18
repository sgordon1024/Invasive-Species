import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { number } from '../lib/format';
import Modal from '../components/Modal';

function stockBadge(onHand, reorder) {
  if (onHand <= 0) return <span className="badge badge-out">Out of stock</span>;
  if (onHand <= reorder) return <span className="badge badge-low">Low</span>;
  return <span className="badge badge-ok">In stock</span>;
}

export default function Inventory() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [adjust, setAdjust] = useState(null); // product row
  const [mode, setMode] = useState('received'); // received | adjustment | waste
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ops_product_stock')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) setNeedsSetup(/relation|does not exist|schema cache/i.test(error.message));
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdjust = (p) => { setAdjust(p); setMode('received'); setQty(''); setNote(''); };

  const save = async (e) => {
    e.preventDefault();
    const n = parseInt(qty, 10);
    if (Number.isNaN(n) || n === 0) { alert('Enter a non-zero quantity.'); return; }
    if (mode !== 'adjustment' && n < 0) { alert('Enter a positive quantity.'); return; }
    setSaving(true);
    // received adds stock; waste removes; adjustment is the signed delta as typed.
    const delta = mode === 'received' ? n : mode === 'waste' ? -Math.abs(n) : n;
    const { error } = await supabase.from('ops_stock_movements').insert({
      product_id: adjust.id,
      qty: delta,
      type: mode,
      note: note.trim() || null,
      created_by: user?.email ?? null,
    });
    setSaving(false);
    if (error) { alert(error.message); return; }
    setAdjust(null);
    load();
  };

  const lowCount = rows.filter((r) => r.on_hand <= r.reorder_point).length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-sub">
            On-hand stock across the lineup{lowCount > 0 ? ` · ${lowCount} need attention` : ''}.
          </p>
        </div>
      </div>

      {needsSetup && (
        <div className="banner">
          Database tables not found. Run <strong>platform/schema.sql</strong> in your Supabase SQL editor first.
        </div>
      )}

      {loading ? (
        <div className="empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="card empty">
          <strong>No products yet</strong>
          Add products first, then receive stock here.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th className="num">On Hand</th>
                <th className="num">Reorder At</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}<span className="muted">{p.size ? ` · ${p.size}` : ''}</span></td>
                  <td className="muted">{p.category}</td>
                  <td className="num"><strong>{number(p.on_hand)}</strong></td>
                  <td className="num muted">{p.reorder_point}</td>
                  <td>{stockBadge(p.on_hand, p.reorder_point)}</td>
                  <td className="num"><button className="btn btn-ghost btn-sm" onClick={() => openAdjust(p)}>Adjust</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adjust && (
        <Modal title={`Adjust Stock — ${adjust.name}`} onClose={() => setAdjust(null)}>
          <form onSubmit={save}>
            <p className="muted" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              Current on hand: <strong style={{ color: 'var(--text)' }}>{number(adjust.on_hand)}</strong>
            </p>
            <label className="field">
              <span>Type</span>
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="received">Received (add stock)</option>
                <option value="waste">Waste / loss (remove stock)</option>
                <option value="adjustment">Manual correction (+/-)</option>
              </select>
            </label>
            <label className="field">
              <span>{mode === 'adjustment' ? 'Quantity (use the sign you mean, e.g. -2)' : 'Quantity'}</span>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder={mode === 'adjustment' ? 'e.g. -2 or 5' : 'e.g. 12'}
                step="1"
                required
                autoFocus
              />
            </label>
            <label className="field">
              <span>Note (optional)</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Delivery from distributor" />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setAdjust(null)}>Cancel</button>
              <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Saving…' : 'Apply'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
