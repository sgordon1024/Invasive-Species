import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { money, dateTime } from '../lib/format';
import Modal from '../components/Modal';

const CHANNELS = ['Taproom', 'Distribution', 'Online', 'Other'];

export default function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // record-sale form
  const [customer, setCustomer] = useState('');
  const [channel, setChannel] = useState('Taproom');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState([{ product_id: '', quantity: 1, unit_price: '' }]);

  const load = async () => {
    setLoading(true);
    const [{ data: s, error: e1 }, { data: p, error: e2 }] = await Promise.all([
      supabase.from('ops_sales').select('*, ops_sale_items(quantity)').order('sold_at', { ascending: false }).limit(100),
      supabase.from('ops_products').select('id, name, unit_price, is_active').eq('is_active', true).order('name'),
    ]);
    if (e1 || e2) setNeedsSetup(/relation|does not exist|schema cache/i.test((e1 || e2).message));
    setSales(s || []);
    setProducts(p || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setCustomer(''); setChannel('Taproom'); setNote('');
    setLines([{ product_id: '', quantity: 1, unit_price: '' }]);
    setOpen(true);
  };

  const setLine = (i, patch) => setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addLine = () => setLines((ls) => [...ls, { product_id: '', quantity: 1, unit_price: '' }]);
  const removeLine = (i) => setLines((ls) => (ls.length === 1 ? ls : ls.filter((_, idx) => idx !== i)));

  const onProductPick = (i, productId) => {
    const prod = products.find((p) => p.id === productId);
    setLine(i, { product_id: productId, unit_price: prod ? prod.unit_price : '' });
  };

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0);

  const save = async (e) => {
    e.preventDefault();
    const items = lines
      .filter((l) => l.product_id && Number(l.quantity) > 0)
      .map((l) => ({ product_id: l.product_id, quantity: Number(l.quantity), unit_price: Number(l.unit_price) || 0 }));
    if (items.length === 0) { alert('Add at least one product.'); return; }
    setSaving(true);
    const { error } = await supabase.rpc('ops_record_sale', {
      p_items: items,
      p_customer: customer.trim() || null,
      p_channel: channel,
      p_note: note.trim() || null,
      p_created_by: user?.email ?? null,
    });
    setSaving(false);
    if (error) { alert(error.message); return; }
    setOpen(false);
    load();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-sub">Record sales and review history. Each sale updates inventory automatically.</p>
        </div>
        <button className="btn btn-accent" onClick={openModal}>+ Record Sale</button>
      </div>

      {needsSetup && (
        <div className="banner">
          Database tables not found. Run <strong>platform/schema.sql</strong> in your Supabase SQL editor first.
        </div>
      )}

      {loading ? (
        <div className="empty">Loading…</div>
      ) : sales.length === 0 ? (
        <div className="card empty">
          <strong>No sales recorded yet</strong>
          Record your first sale to start tracking revenue and stock.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Channel</th>
                <th className="num">Items</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const items = (s.ops_sale_items || []).reduce((n, it) => n + (it.quantity || 0), 0);
                return (
                  <tr key={s.id}>
                    <td>{dateTime(s.sold_at)}</td>
                    <td>{s.customer_name || <span className="muted">—</span>}</td>
                    <td><span className="badge badge-muted">{s.channel}</span></td>
                    <td className="num muted">{items}</td>
                    <td className="num"><strong>{money(s.total)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Record Sale" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="field-row">
              <label className="field">
                <span>Customer (optional)</span>
                <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Walk-in / account name" />
              </label>
              <label className="field">
                <span>Channel</span>
                <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                  {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>

            <span className="field" style={{ marginBottom: '0.4rem' }}><span>Line items</span></span>
            {lines.map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 92px 28px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <select value={l.product_id} onChange={(e) => onProductPick(i, e.target.value)} required
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.55rem 0.6rem', color: 'var(--text)', font: 'inherit', fontSize: '0.85rem' }}>
                  <option value="">Select product…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" min="1" step="1" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} aria-label="Quantity"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.55rem 0.5rem', color: 'var(--text)', font: 'inherit', fontSize: '0.85rem', textAlign: 'right' }} />
                <input type="number" min="0" step="0.01" value={l.unit_price} onChange={(e) => setLine(i, { unit_price: e.target.value })} aria-label="Unit price" placeholder="$"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.55rem 0.5rem', color: 'var(--text)', font: 'inherit', fontSize: '0.85rem', textAlign: 'right' }} />
                <button type="button" className="modal-close" onClick={() => removeLine(i)} aria-label="Remove line" style={{ fontSize: '1.1rem' }}>×</button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={addLine}>+ Add line</button>

            <label className="field" style={{ marginTop: '1rem' }}>
              <span>Note (optional)</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} />
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
              <span className="muted">Total</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>{money(total)}</strong>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Recording…' : 'Record Sale'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
