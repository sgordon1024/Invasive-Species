import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { money, number, daysAgoISO } from '../lib/format';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, count: 0, activeProducts: 0, lowStock: 0 });
  const [week, setWeek] = useState([]);      // [{ label, value }]
  const [top, setTop] = useState([]);        // [{ name, revenue }]
  const [low, setLow] = useState([]);        // low/out products

  useEffect(() => {
    (async () => {
      const since30 = daysAgoISO(30);

      const [sales30, stock, items30] = await Promise.all([
        supabase.from('ops_sales').select('total, sold_at').gte('sold_at', since30),
        supabase.from('ops_product_stock').select('name, on_hand, reorder_point, is_active'),
        supabase.from('ops_sale_items').select('line_total, quantity, ops_products(name), ops_sales!inner(sold_at)').gte('ops_sales.sold_at', since30),
      ]);

      if (sales30.error || stock.error) {
        const msg = (sales30.error || stock.error).message;
        if (/relation|does not exist|schema cache/i.test(msg)) setNeedsSetup(true);
      }

      const sales = sales30.data || [];
      const revenue = sales.reduce((s, r) => s + Number(r.total || 0), 0);

      const stockRows = (stock.data || []).filter((r) => r.is_active);
      const lowRows = stockRows.filter((r) => r.on_hand <= r.reorder_point);

      // revenue per day, last 7 days
      const buckets = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        const value = sales
          .filter((s) => (s.sold_at || '').slice(0, 10) === key)
          .reduce((sum, s) => sum + Number(s.total || 0), 0);
        buckets.push({ label, value });
      }

      // top products by revenue (30d)
      const byProduct = {};
      (items30.data || []).forEach((it) => {
        const name = it.ops_products?.name || 'Unknown';
        byProduct[name] = (byProduct[name] || 0) + Number(it.line_total || 0);
      });
      const topRows = Object.entries(byProduct)
        .map(([name, rev]) => ({ name, revenue: rev }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        revenue,
        count: sales.length,
        activeProducts: stockRows.length,
        lowStock: lowRows.length,
      });
      setWeek(buckets);
      setTop(topRows);
      setLow(lowRows.sort((a, b) => a.on_hand - b.on_hand));
      setLoading(false);
    })();
  }, []);

  const maxBar = Math.max(1, ...week.map((w) => w.value));

  if (loading) return <div className="empty">Loading…</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Last 30 days at a glance.</p>
        </div>
      </div>

      {needsSetup && (
        <div className="banner">
          Database tables not found. Run <strong>platform/schema.sql</strong> in your Supabase SQL editor to finish setup.
        </div>
      )}

      <div className="stat-grid">
        <div className="card">
          <div className="stat-label">Revenue (30d)</div>
          <div className="stat-value accent">{money(stats.revenue)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Sales (30d)</div>
          <div className="stat-value">{number(stats.count)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Active Products</div>
          <div className="stat-value">{number(stats.activeProducts)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Low / Out of Stock</div>
          <div className="stat-value" style={{ color: stats.lowStock ? 'var(--warn)' : 'var(--text)' }}>{number(stats.lowStock)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-title">Revenue — last 7 days</h2>
        <div className="bars">
          {week.map((w, i) => (
            <div className="bar-col" key={i}>
              <div className="bar" style={{ height: `${(w.value / maxBar) * 100}%` }} title={money(w.value)} />
              <span className="bar-label">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <h2 className="section-title">Top Sellers (30d)</h2>
          {top.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.85rem' }}>No sales in the last 30 days.</p>
          ) : (
            <table className="data" style={{ marginTop: '-0.25rem' }}>
              <tbody>
                {top.map((t) => (
                  <tr key={t.name}>
                    <td>{t.name}</td>
                    <td className="num"><strong>{money(t.revenue)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Needs Restock</h2>
          {low.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.85rem' }}>Everything’s well stocked. 🍻</p>
          ) : (
            <table className="data" style={{ marginTop: '-0.25rem' }}>
              <tbody>
                {low.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td className="num">
                      {p.on_hand <= 0
                        ? <span className="badge badge-out">Out</span>
                        : <span className="badge badge-low">{p.on_hand} left</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
