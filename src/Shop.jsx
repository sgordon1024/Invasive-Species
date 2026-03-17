import { useState } from 'react';
import './Shop.css';

import imgClassicTee      from './assets/photos/Classic Logo Tee Mockup.png';
import imgHoodie          from './assets/photos/Logo Hoodie Mockup.png';
import imgDadCap          from './assets/photos/Logo Dad Cap Mockup.png';
import imgSnapback        from './assets/photos/Mockup Logo Snapback Hat.png';
import imgShakerPint      from './assets/photos/Mockup Logo Shaker Pint Glass.png';
import imgTulipGlass      from './assets/photos/Logo Tulip Glass Mockup.png';
import imgGlassGrowler    from './assets/photos/Logo Mockup 64oz Glass Growler.png';
import imgStainlessGrowler from './assets/photos/Logo Mockup on Growler.png';
import imgBottleOpener    from './assets/photos/Logo Bottle Opener Mockup.png';
import imgGiftSet         from "./assets/photos/Brewer's Gift Set Mockup with Logo.png";
import imgToteBag         from './assets/photos/Canvas Tote Bag Mockup.png';
import imgStickerPack     from './assets/photos/Sticker Pack Mockup with Logo.png';

const ACCENT = '#39FF14';

const products = [
  {
    id: 1,
    name: 'Classic Logo Tee',
    price: 28,
    desc: 'Soft 100% cotton tee with the Invasive Species iguana logo. Available in black.',
    img: imgClassicTee,
    category: 'Apparel',
  },
  {
    id: 2,
    name: 'Logo Hoodie',
    price: 55,
    desc: 'Heavyweight pullover hoodie with embroidered iguana logo on the chest.',
    img: imgHoodie,
    category: 'Apparel',
  },
  {
    id: 3,
    name: 'Dad Cap',
    price: 32,
    desc: 'Unstructured 6-panel cap with embroidered logo patch. One size fits all.',
    img: imgDadCap,
    category: 'Apparel',
  },
  {
    id: 4,
    name: 'Snapback Hat',
    price: 30,
    desc: 'Flat-brim snapback with woven logo patch. Adjustable fit.',
    img: imgSnapback,
    category: 'Apparel',
  },
  {
    id: 5,
    name: 'Shaker Pint Glass (4-pack)',
    price: 24,
    desc: '16oz classic shaker pint glasses screen-printed with the ISB logo. Dishwasher safe.',
    img: imgShakerPint,
    category: 'Glassware',
  },
  {
    id: 6,
    name: 'Tulip Glass (2-pack)',
    price: 22,
    desc: '13oz tulip glasses — the ideal shape for IPAs, sours, and Belgian-style beers.',
    img: imgTulipGlass,
    category: 'Glassware',
  },
  {
    id: 7,
    name: '64oz Glass Growler',
    price: 18,
    desc: 'Classic amber glass growler with a swing-top lid. Fill it up at the taproom.',
    img: imgGlassGrowler,
    category: 'Glassware',
  },
  {
    id: 8,
    name: 'Stainless Growler',
    price: 45,
    desc: '64oz vacuum-insulated stainless steel growler. Keeps beer cold for 24 hours.',
    img: imgStainlessGrowler,
    category: 'Glassware',
  },
  {
    id: 9,
    name: 'Bottle Opener Keychain',
    price: 12,
    desc: 'Solid brass bottle opener with the ISB logo laser-engraved. Clips to your keys.',
    img: imgBottleOpener,
    category: 'Accessories',
  },
  {
    id: 10,
    name: 'Canvas Tote Bag',
    price: 20,
    desc: 'Heavy natural canvas tote with an oversized screen-printed iguana graphic.',
    img: imgToteBag,
    category: 'Accessories',
  },
  {
    id: 11,
    name: 'Sticker Pack (5-pack)',
    price: 10,
    desc: 'Waterproof vinyl stickers. Mix of logo, iguana, and slogan designs.',
    img: imgStickerPack,
    category: 'Accessories',
  },
  {
    id: 12,
    name: "Brewer's Gift Set",
    price: 52,
    desc: 'The perfect gift — includes a tulip glass, bottle opener keychain, and sticker pack.',
    img: imgGiftSet,
    category: 'Accessories',
  },
];

const emptyForm = {
  name: '', email: '', address: '', city: '', state: '', zip: '',
  card: '', expiry: '', cvv: '',
};

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + ' / ' + digits.slice(2) : digits;
}

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState('cart'); // 'cart' | 'shipping' | 'payment' | 'confirm'
  const [form, setForm] = useState(emptyForm);
  const [addedId, setAddedId] = useState(null);
  const [orderNumber] = useState(() => Math.floor(10000 + Math.random() * 90000));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const updateQty = (id, qty) => {
    if (qty < 1) { setCart(prev => prev.filter(i => i.id !== id)); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const openCart = () => { setStep('cart'); setDrawerOpen(true); };

  const handleFormChange = (e) => {
    let { name, value } = e.target;
    if (name === 'card') value = formatCard(value);
    if (name === 'expiry') value = formatExpiry(value);
    if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = (e) => {
    e.preventDefault();
    setStep('confirm');
    setCart([]);
  };

  const closeAndReset = () => {
    setDrawerOpen(false);
    setTimeout(() => { setStep('cart'); setForm(emptyForm); }, 300);
  };

  const stepLabels = ['Cart', 'Shipping', 'Payment'];
  const stepIndex = { cart: 0, shipping: 1, payment: 2, confirm: 3 };

  return (
    <>
      {/* Cart status live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {addedId ? `${products.find(p => p.id === addedId)?.name} added to cart` : ''}
      </div>

      {/* ─── SHOP SECTION ─── */}
      <section id="shop" className="shop-section">
        <div className="shop-header">
          <p className="section-eyebrow">Invasive Species</p>
          <h2>Brew <span style={{ color: ACCENT }}>Shop</span></h2>
          <p className="shop-subhead">Merch, glassware &amp; accessories for the true enthusiast.</p>
        </div>

        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-img-wrap">
                {product.img
                  ? <img src={product.img} alt={product.name} loading="lazy" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#333', fontSize: '0.75rem', letterSpacing: '0.1em' }}>IMAGE COMING SOON</div>
                }
              </div>
              <div className="product-body">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.desc}</p>
                <div className="product-footer">
                  <span className="product-price" style={{ color: ACCENT }}>${product.price}.00</span>
                  <button
                    className={`add-btn${addedId === product.id ? ' added' : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    {addedId === product.id ? '✓ Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CART FAB ─── */}
      {cartCount > 0 && (
        <button className="cart-fab" onClick={openCart} aria-label="Open cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span className="cart-fab-badge">{cartCount}</span>
        </button>
      )}

      {/* ─── DRAWER OVERLAY ─── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={closeAndReset}>
          <div
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={step === 'confirm' ? 'Order confirmed' : step === 'cart' ? 'Your cart' : step === 'shipping' ? 'Shipping information' : 'Payment information'}
            onClick={e => e.stopPropagation()}
          >

            {/* Header */}
            <div className="drawer-header">
              {step !== 'confirm' && step !== 'cart' && (
                <button className="drawer-back" onClick={() => setStep(step === 'payment' ? 'shipping' : 'cart')}>
                  ← Back
                </button>
              )}
              <h3 className="drawer-title">
                {step === 'cart' && 'Your Cart'}
                {step === 'shipping' && 'Shipping'}
                {step === 'payment' && 'Payment'}
                {step === 'confirm' && 'Order Confirmed'}
              </h3>
              <button className="drawer-close" onClick={closeAndReset} aria-label="Close cart">✕</button>
            </div>

            {/* Progress bar */}
            {step !== 'confirm' && (
              <div className="checkout-progress">
                {stepLabels.map((label, i) => (
                  <div key={label} className={`progress-step${stepIndex[step] >= i ? ' active' : ''}`}>
                    <div className="progress-dot" />
                    <span>{label}</span>
                    {i < stepLabels.length - 1 && <div className="progress-line" />}
                  </div>
                ))}
              </div>
            )}

            {/* ── CART ── */}
            {step === 'cart' && (
              <div className="drawer-body">
                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <p>Your cart is empty.</p>
                    <button className="checkout-btn" onClick={closeAndReset}>Keep Shopping</button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map(item => (
                        <div key={item.id} className="cart-item">
                          <img src={item.img} alt={item.name} className="cart-item-img" />
                          <div className="cart-item-info">
                            <span className="cart-item-name">{item.name}</span>
                            <span className="cart-item-unit">${item.price}.00 each</span>
                            <div className="qty-control">
                              <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label={`Decrease quantity of ${item.name}`}>−</button>
                              <span aria-label={`Quantity: ${item.qty}`}>{item.qty}</span>
                              <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label={`Increase quantity of ${item.name}`}>+</button>
                            </div>
                          </div>
                          <div className="cart-item-right">
                            <span className="cart-item-total" style={{ color: ACCENT }}>
                              ${(item.price * item.qty).toFixed(2)}
                            </span>
                            <button className="remove-btn" onClick={() => updateQty(item.id, 0)} aria-label={`Remove ${item.name} from cart`}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="cart-summary">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping</span>
                        <span style={{ color: ACCENT }}>Free</span>
                      </div>
                      <div className="summary-row total-row">
                        <span>Total</span>
                        <span style={{ color: ACCENT }}>${cartTotal.toFixed(2)}</span>
                      </div>
                      <button className="checkout-btn" onClick={() => setStep('shipping')}>
                        Checkout →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── SHIPPING ── */}
            {step === 'shipping' && (
              <div className="drawer-body">
                <form className="checkout-form" onSubmit={e => { e.preventDefault(); setStep('payment'); }}>
                  <div className="form-group">
                    <label htmlFor="checkout-name">Full Name</label>
                    <input id="checkout-name" name="name" placeholder="Jane Smith" value={form.name} onChange={handleFormChange} required autoComplete="name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkout-email">Email</label>
                    <input id="checkout-email" name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleFormChange} required autoComplete="email" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkout-address">Street Address</label>
                    <input id="checkout-address" name="address" placeholder="726 NE 2nd Ave" value={form.address} onChange={handleFormChange} required autoComplete="street-address" />
                  </div>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="checkout-city">City</label>
                      <input id="checkout-city" name="city" placeholder="Fort Lauderdale" value={form.city} onChange={handleFormChange} required autoComplete="address-level2" />
                    </div>
                    <div className="form-group form-group-sm">
                      <label htmlFor="checkout-state">State</label>
                      <input id="checkout-state" name="state" placeholder="FL" value={form.state} onChange={handleFormChange} maxLength={2} required autoComplete="address-level1" />
                    </div>
                    <div className="form-group form-group-sm">
                      <label htmlFor="checkout-zip">ZIP</label>
                      <input id="checkout-zip" name="zip" placeholder="33304" value={form.zip} onChange={handleFormChange} maxLength={5} required autoComplete="postal-code" />
                    </div>
                  </div>
                  <button type="submit" className="checkout-btn">Continue to Payment →</button>
                </form>
              </div>
            )}

            {/* ── PAYMENT ── */}
            {step === 'payment' && (
              <div className="drawer-body">
                <div className="demo-notice">
                  Demo only — no real charge will be made.
                </div>
                <form className="checkout-form" onSubmit={placeOrder}>
                  <div className="form-group">
                    <label htmlFor="checkout-card">Card Number</label>
                    <input
                      id="checkout-card"
                      name="card"
                      placeholder="1234 5678 9012 3456"
                      value={form.card}
                      onChange={handleFormChange}
                      required
                      inputMode="numeric"
                      autoComplete="cc-number"
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="checkout-expiry">Expiry</label>
                      <input id="checkout-expiry" name="expiry" placeholder="MM / YY" value={form.expiry} onChange={handleFormChange} required inputMode="numeric" autoComplete="cc-exp" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="checkout-cvv">CVV</label>
                      <input id="checkout-cvv" name="cvv" placeholder="123" value={form.cvv} onChange={handleFormChange} maxLength={4} required inputMode="numeric" autoComplete="cc-csc" />
                    </div>
                  </div>
                  <div className="order-total-box">
                    <span>Order Total</span>
                    <span style={{ color: ACCENT, fontWeight: 700 }}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button type="submit" className="checkout-btn checkout-btn-confirm">
                    Place Order
                  </button>
                </form>
              </div>
            )}

            {/* ── CONFIRMATION ── */}
            {step === 'confirm' && (
              <div className="drawer-body confirm-body">
                <div className="confirm-icon" style={{ color: ACCENT }}>✓</div>
                <h3 className="confirm-title">Order Placed!</h3>
                <p className="confirm-order-num">Order #{orderNumber}</p>
                <p className="confirm-message">
                  Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}! Your order is confirmed.
                  {form.email && <> A receipt will be sent to <strong>{form.email}</strong>.</>}
                </p>
                <div className="confirm-address">
                  <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '1rem' }}>Shipping to:</p>
                  <p style={{ color: '#ccc', fontSize: '0.85rem' }}>{form.address}, {form.city}, {form.state} {form.zip}</p>
                </div>
                <button className="checkout-btn" style={{ marginTop: '2.5rem' }} onClick={closeAndReset}>
                  Back to Shop
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
