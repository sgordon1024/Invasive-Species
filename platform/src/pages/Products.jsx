import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { money } from '../lib/format';
import Modal from '../components/Modal';

const CATEGORIES = ['Bourbon', 'Rum', 'Vodka', 'Whiskey', 'Gin', 'Spirit', 'Beer', 'Other'];

const blank = {
  name: '', category: 'Bourbon', size: '750ml', proof: '',
  sku: '', unit_price: '', unit_cost: '', reorder_point: '', is_active: true,
};

export default function Products() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [editing, setEditing] = useState(null); // product object or blank
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ops_products')
      .select('*')
      .order('name');
    if (error) setNeedsSetup(/relation|does not exist|schema cache/i.test(error.message));
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(blank); setEditing('new'); };
  const openEdit = (p) => {
    setForm({
      name: p.name, category: p.category, size: p.size || '', proof: p.proof || '',
      sku: p.sku || '', unit_price: p.unit_price, unit_cost: p.unit_cost,
      reorder_point: p.reorder_point, is_active: p.is_active,
    });
    setEditing(p.id);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      size: form.size.trim() || null,
      proof: form.proof.trim() || null,
      sku: form.sku.trim() || null,
      unit_price: Number(form.unit_price) || 0,
      unit_cost: Number(form.unit_cost) || 0,
      reorder_point: parseInt(form.reorder_point, 10) || 0,
      is_active: form.is_active,
    };
    const res = editing === 'new'
      ? await supabase.from('ops_products').insert(payload)
      : await supabase.from('ops_products').update(payload).eq('id', editing);
    setSaving(false);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-sub">Your spirits catalog — prices, cost, and reorder points.</p>
        </div>
        <button className="btn btn-accent" onClick={openNew}>+ Add Product</button>
      </div>

      {needsSetup && (
        <div className="banner">
          Database tables not found. Run <strong>platform/schema.sql</strong> in your Supabase SQL editor to set things up.
        </div>
      )}

      {loading ? (
        <div className="empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="card empty">
          <strong>No products yet</strong>
          Add your first spirit to start tracking sales and inventory.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Size</th>
                <th className="num">Price</th>
                <th className="num">Cost</th>
                <th className="num">Reorder At</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}{p.proof ? <span className="muted"> · {p.proof}</span> : ''}</td>
                  <td className="muted">{p.category}</td>
                  <td className="muted">{p.size || '—'}</td>
                  <td className="num">{money(p.unit_price)}</td>
                  <td className="num muted">{money(p.unit_cost)}</td>
                  <td className="num muted">{p.reorder_point}</td>
                  <td>{p.is_active ? <span className="badge badge-ok">Active</span> : <span className="badge badge-muted">Inactive</span>}</td>
                  <td className="num"><button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add Product' : 'Edit Product'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <label className="field">
              <span>Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Category</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Size</span>
                <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="750ml" />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Proof / ABV</span>
                <input value={form.proof} onChange={(e) => setForm({ ...form, proof: e.target.value })} placeholder="80 proof" />
              </label>
              <label className="field">
                <span>SKU (optional)</span>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Sale Price ($)</span>
                <input type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} required />
              </label>
              <label className="field">
                <span>Unit Cost ($)</span>
                <input type="number" step="0.01" min="0" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Reorder Point</span>
                <input type="number" min="0" value={form.reorder_point} onChange={(e) => setForm({ ...form, reorder_point: e.target.value })} placeholder="6" />
              </label>
              <label className="field">
                <span>Status</span>
                <select value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
