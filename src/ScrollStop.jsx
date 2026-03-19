import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './ScrollStop.css';
import taglineImg from './assets/tagline.png';
import alligatorImg from './assets/alligator.png';
import alligator2Img from './assets/alligator-2.png';
import beaverImg from './assets/beaver.png';
import birdOfParadiseImg from './assets/Bird of Paradise.png';
import berryImg from './assets/berry.png';
import cobraImg from './assets/cobra.png';
import deerImg from './assets/deer.png';
import logoImg from './assets/logo-white-new.png';
import laCondesaFood1 from './assets/photos/La Condesa Taqueria.webp';
import laCondesaFood2 from './assets/photos/La Condesa Taqueria 70A4715 Edit.webp';
import photo1 from './assets/photos/invasive-species-brewing.jpeg';
import photo2 from './assets/photos/IMG_5759.jpg';
import photo3 from './assets/photos/IMG_5769.jpg';
import photo4 from './assets/photos/IMG_5721.jpg';
import photo5 from './assets/photos/IMG_57681.jpg';
import photo6 from './assets/photos/IMG_5711.jpg';
import photo7 from './assets/photos/IMG_5712.jpg';
import photo8 from './assets/photos/IMG_5713.jpg';
import photo9 from './assets/photos/IMG_57621.jpg';
import photo10 from './assets/photos/IMG_57651.jpg';

const photos = [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8, photo9, photo10];

const TOTAL_FRAMES = 121;

const ACCENT = '#39FF14';

function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

const DEFAULT_MENU = {
  Lagers: [
    { name: 'Yacht Club', price: '$6.50', desc: 'Florida Pilsner. Crisp, refreshing lager brewed for Florida\'s Endless Summer.', abv: '4.5%' },
    { name: 'SHTY Beer', price: '$6.50', desc: 'American Light Lager. Collab with @ShithouseMouse.', abv: '5%' },
    { name: 'Country Club', price: '$6.50', desc: 'Czech Pilsner.', abv: '5%' },
    { name: 'Curbside', price: '$6.50', desc: 'Amber Lager. German-style.', abv: '4.8%' },
    { name: 'Rauchbier', price: '$6.50', desc: 'Smoked Lager. Bamberg-style smoked Märzen.', abv: '5%' },
    { name: 'Schwarzbier', price: '$6.50', desc: 'Dark Lager. German-style.', abv: '5.2%' },
    { name: 'Maibock', price: '$6.50', desc: 'Strong Golden Lager. German-style.', abv: '7%' },
  ],
  'Hoppy & Juicy': [
    { name: 'Layover', price: '$7.50', desc: 'Hazy IPA. DDH w/ Nelson Sauvin, Citra, Cashmere & Mosaic.', abv: '6%' },
    { name: 'Lunch Date', price: '$7.50', desc: 'Hazy IPA. DDH w/ Cashmere, Citra, Mosaic & Strata.', abv: '6.5%' },
    { name: 'Krampus', price: '$7.50', desc: 'Hazy IPA. DDH w/ Nectaron, Strata & Citra.', abv: '7%' },
    { name: 'Undead Haze', price: '$7.50', desc: 'Hazy IPA. DDH w/ El Dorado, Citra & Nelson Sauvin.', abv: '7.2%' },
    { name: 'Loakals Only', price: '$7.50', desc: 'Hazy IPA. Aged on White Oak. DDH w/ Citra & Nelson.', abv: '7.2%' },
    { name: 'Brain Tease', price: '$7.50', desc: 'Hazy IPA. DDH w/ Sabro, Citra & Cashmere.', abv: '7.5%' },
    { name: 'Battle Llama', price: '$7.50', desc: 'Hazy IPA. DDH w/ Nelson Sauvin, Citra & Mosaic.', abv: '7.8%' },
    { name: 'Cuban Link', price: '$8', desc: 'Hazy DIPA. DDH w/ Strata & Nelson Sauvin.', abv: '8%' },
    { name: 'Float Switch', price: '$8', desc: 'Oated DIPA. DDH w/ Talus, Cashmere, Citra & Sabro.', abv: '8%' },
    { name: 'Westies are for Besties', price: '$8', desc: 'West Coast DIPA. Centennial, Chinook & Citra.', abv: '8.5%' },
    { name: 'Space Chaser', price: '$9', desc: 'Hazy TIPA. DDH w/ Galaxy, Citra & Strata.', abv: '9.5%' },
  ],
  Sours: [
    { name: 'Guava Pastelito', price: '$8', desc: 'Pastry Sour. Kettle Sour finished w/ Guava & Cream Cheese. Contains Lactose.', abv: '7%' },
    { name: '2-Way Petting Zoo', price: '$8', desc: 'Kettle Sour. Pineapple, Prickly Pear & Passionfruit.', abv: '7%' },
    { name: 'Jazz Flute', price: '$8', desc: 'Kettle Sour. Blueberry, Blackberry & Raspberry.', abv: '7%' },
    { name: 'Mango Painkiller', price: '$8', desc: 'Cocktail Sour. Mango, Pineapple & Coconut Gelato. Lactose Free.', abv: '7%' },
  ],
  "Malty N' Dark": [
    { name: 'Mild Marker', price: '$7', desc: 'English Dark Mild on NITRO.', abv: '3.5%' },
    { name: 'Beam Me Down', price: '$7', desc: 'Scottish Ale on NITRO.', abv: '4.2%' },
    { name: 'Octodon', price: '$10', desc: 'BBA Imperial Stout. 2YR Bourbon Barrel Aged w/ Coconut, Chocolate, Vanilla & Coffee.', abv: '15%' },
    { name: 'The Shadow', price: '$10', desc: 'BBA Imperial Stout. Bourbon Barrel-Aged w/ Chocolate, Hazelnut, Cinnamon & Vanilla.', abv: '15%' },
  ],
  'Something New': [
    { name: 'Ninja Juice', price: '$9', desc: 'Sake Hybrid. Rice & Pilsner malt fermented with Japanese sake yeast.', abv: '10%' },
    { name: 'Ghost Orchid', price: '$6.50', desc: 'Saison. Dry and effervescent w/ banana, clove & bubblegum notes.', abv: '5.6%' },
    { name: 'Best Bitter', price: '$6', desc: 'English Session Ale. British heirloom malt & traditional hops.', abv: '4%' },
  ],
  'Anything But Beer': [
    { name: 'Sparkling Italian Wine (Scarpetta)', price: '$8', desc: '250mL can.', abv: '' },
    { name: 'Prosecco (Jeio)', price: '$9', desc: '187mL split, Italy.', abv: '' },
    { name: 'Pinot Grigio (Jermann 2021)', price: '$22', desc: '375mL half bottle, Italy.', abv: '' },
    { name: 'Sauvignon Blanc (Honig 2021)', price: '$22', desc: '375mL, Napa County.', abv: '' },
    { name: 'Chardonnay (Alexander Valley 2019)', price: '$22', desc: '375mL, Sonoma County.', abv: '' },
    { name: 'Cabernet Sauvignon (Beringer Knights Valley 2018)', price: '$22', desc: '375mL, Sonoma County.', abv: '' },
    { name: 'Pinot Noir (J Vineyards)', price: '$22', desc: '375mL, California.', abv: '' },
    { name: 'Merlot (Alexander Valley 2020)', price: '$22', desc: '375mL, Sonoma County.', abv: '' },
    { name: 'Dry White Cider (Wolfer)', price: '$7', desc: '12oz. Gluten Free.', abv: '' },
    { name: 'Peach Hard Cider (Wolfer)', price: '$7', desc: '12oz. Gluten Free.', abv: '' },
    { name: 'Bitburger 0.0%', price: '$6', desc: 'Alcohol-free German Pilsner.', abv: '0%' },
    { name: 'Soda', price: '$3', desc: 'Rotating sodas & flavored seltzers.', abv: '' },
  ],
  'Take Me Home Tonight': [
    { name: 'High Rye Bourbon', price: '$39 / bottle', desc: '4-year aged Straight Bourbon, 80 proof. 750ml.', abv: '80 proof' },
    { name: 'Show Pony - Sweet Tea Bourbon', price: '$42 / bottle', desc: 'Southern-style sweet tea bourbon with black tea. 750ml.', abv: '' },
    { name: 'High Rye Ninety Nine Bourbon', price: '$42 / bottle', desc: '4-year aged, 99 proof. 750ml.', abv: '99 proof' },
    { name: 'Amburana Cask Bourbon', price: '$42 / bottle', desc: 'Aged in Brazilian Amburana wood, 95 proof. 750ml.', abv: '95 proof' },
    { name: 'Barrel Aged Florida Rum', price: '$36 / bottle', desc: '4-year aged in Bourbon barrels, 80 proof. 750ml.', abv: '80 proof' },
    { name: 'Sugarcane Vodka', price: '$33 / bottle', desc: 'Quadruple distilled & double filtered. 750ml.', abv: '80 proof' },
  ],
};

const RolodexText = ({ text, baseDelay, style, visible }) => (
  <span className="stat-num" style={{ color: ACCENT, ...style }}>
    {visible
      ? text.split('').map((char, i) => (
          <span key={i} className="rolodex-slot">
            <span className="rolodex-char" style={{ animationDelay: `${baseDelay + i * 0.06}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          </span>
        ))
      : <span style={{ visibility: 'hidden' }}>{text}</span>
    }
  </span>
);

const ScrollStopSite = () => {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const storyRef = useRef(null);
  const menuRef = useRef(null);
  const statsRef = useRef(null);
  const statsTriggeredRef = useRef(false);
  const [images, setImages] = useState([]);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [storyRelY, setStoryRelY] = useState(0);
  const [menuRelY, setMenuRelY] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState(null); // null | 'success' | 'error'
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [beerMenu, setBeerMenu] = useState(DEFAULT_MENU);

  const trucks = [
    {
      id: 'tightlines',
      name: 'Tight Lines Food Shack',
      days: 'Mon – Tue',
      tagline: 'Fresh-caught flavor, handmade with care.',
      story: "Tight Lines Food Shack is all about fresh ingredients and handmade food done right. Born from a love of Florida's coastal culture, they bring the flavor of the sea straight to your plate — perfectly fried fish, loaded tots, and tacos that punch well above their weight. Originally from Delray Beach, they park at Invasive Species on Mondays and Tuesdays.",
      menu: ['Fish Sammy', 'Chop Cheese', 'Gringo Tacos', 'Loaded Fries', 'Fish Tacos', 'Loaded Tots'],
      images: [
        'https://tightlinesfoodtruck.com/wp-content/uploads/2023/08/Fish-Sandwich.jpg',
        'https://tightlinesfoodtruck.com/wp-content/uploads/2023/08/Fish-Tacos.jpg',
        'https://tightlinesfoodtruck.com/wp-content/uploads/2023/08/Loaded-Tots.jpg',
      ],
      website: 'https://tightlinesfoodtruck.com',
      instagram: 'https://www.instagram.com/tightlinesfoodshack/',
    },
    {
      id: 'billys',
      name: "Billy's Curbside Kitchen",
      days: 'Wed – Sat',
      tagline: 'Restaurant quality fare meets the curbside.',
      story: "Named Fort Lauderdale Magazine's Best Food Truck of 2021–2022, Billy's Curbside Kitchen brings serious burger craftsmanship to the street. Their smash-style burgers, loaded quesadillas, and hand-cut fries have earned a loyal following throughout South Florida — restaurant-quality food with no reservations required.",
      menu: ['Smash Burgers', 'Double Bacon Cheeseburger', 'Florida Man Slider', 'Quesadillas', 'Wraps', 'Fries & Sides'],
      images: [
        'https://itin-dev.wanderlogstatic.com/freeImage/jldSS3G80L7IK2HI1vpJdSXs7Q12k3uD',
        'https://itin-dev.wanderlogstatic.com/freeImage/rYKvXBYcUNtIT0Pae230ZKBivnZu5Q0a',
        'https://itin-dev.wanderlogstatic.com/freeImage/OToquSV9z2zpAgA2nqa9VxGaf8LzIIDj',
      ],
      website: null,
      instagram: 'https://www.instagram.com/billyscurbsidegrill/',
    },
    {
      id: 'condesa',
      name: 'La Condesa Taqueria',
      days: 'Sunday',
      note: 'Starts at noon',
      tagline: 'Authentic Mexican cuisine with a gourmet twist.',
      story: "La Condesa Taqueria brings the bold, vivid flavors of Mexico to South Florida with a fresh upscale approach. From street-style birria and pastor tacos to ceviches, housemade guacamoles, and flan de cajeta — every dish is crafted with authentic ingredients and serious technique. Find them every Sunday starting at noon.",
      menu: ['Birria Tacos', 'Baja Fish Tacos', 'Shrimp Tacos', 'Ceviche Vuelve a la Vida', 'Quesadillas', 'Guacamole La Condesa'],
      images: [laCondesaFood1, laCondesaFood2],
      video: 'https://www.youtube.com/embed/dJe7zsqDYIs?autoplay=1&mute=1&loop=1&playlist=dJe7zsqDYIs&controls=0&modestbranding=1&playsinline=1',
      website: 'https://lacondesataqueria.com/',
      instagram: 'https://www.instagram.com/condesa_taqueria/',
    },
  ];
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = (e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + photos.length - 1) % photos.length); };
  const nextPhoto = (e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % photos.length); };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i + photos.length - 1) % photos.length);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % photos.length);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex]);

  const accentColor = '#39FF14';

  useEffect(() => {
    const frameImages = [];
    let loaded = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameStr = i.toString().padStart(4, '0');
      img.src = `${import.meta.env.BASE_URL}frames/frame_${frameStr}.jpg`;
      img.onload = () => {
        loaded++;
        setLoadedFrames(loaded);
        if (loaded === TOTAL_FRAMES) drawFrame(0, frameImages);
      };
      frameImages.push(img);
    }
    setImages(frameImages);
  }, []);

  const drawFrame = (index, imgs = images) => {
    if (!canvasRef.current || !imgs[index]) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    const img = imgs[index];
    const canvasRatio = rect.width / rect.height;
    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight, offsetX, offsetY;
    if (canvasRatio > imgRatio) {
      drawWidth = rect.width;
      drawHeight = rect.width / imgRatio;
      offsetX = 0;
      offsetY = (rect.height - drawHeight) / 2;
    } else {
      drawWidth = rect.height * imgRatio;
      drawHeight = rect.height;
      offsetX = (rect.width - drawWidth) / 2;
      offsetY = 0;
    }
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const html = document.documentElement;
      const scrollProgress = html.scrollTop;
      setScrollY(scrollProgress);
      if (storyRef.current) {
        const rel = scrollProgress - storyRef.current.offsetTop + window.innerHeight;
        setStoryRelY(Math.max(0, rel));
      }
      if (menuRef.current) {
        const rel = scrollProgress - menuRef.current.offsetTop + window.innerHeight;
        setMenuRelY(Math.max(0, rel));
      }
      if (statsRef.current && !statsTriggeredRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          statsTriggeredRef.current = true;
          setStatsVisible(true);
        }
      }
      // Video scrubs relative to the scroll container's own height
      const containerTop = scrollContainerRef.current.offsetTop;
      const containerHeight = scrollContainerRef.current.offsetHeight;
      const relativeScroll = scrollProgress - containerTop;
      const scrollFraction = Math.max(0, Math.min(1, relativeScroll / (containerHeight - window.innerHeight)));
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(scrollFraction * TOTAL_FRAMES));
      if (frameIndex !== currentFrame) {
        setCurrentFrame(frameIndex);
        requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };
    const handleResize = () => requestAnimationFrame(() => drawFrame(currentFrame));
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentFrame, images]);

  useEffect(() => {
    const url = import.meta.env.VITE_MENU_SHEET_URL;
    if (!url) return;
    fetch(url)
      .then(r => r.text())
      .then(text => {
        const lines = text.trim().split('\n').slice(1);
        const menu = {};
        for (const line of lines) {
          if (!line.trim()) continue;
          const [category, name, price, desc, abv] = parseCSVRow(line);
          if (!category || !name) continue;
          if (!menu[category]) menu[category] = [];
          const normalizedPrice = price && !price.startsWith('$') ? `$${price}` : price;
          menu[category].push({ name, price: normalizedPrice, desc, abv: abv || '' });
        }
        if (Object.keys(menu).length > 0) setBeerMenu(menu);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="site-root">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Loader */}
      {loadedFrames < TOTAL_FRAMES && (
        <div className="loader">
          <img src={logoImg} alt="Invasive Species Brewing logo" style={{ height: '80px', marginBottom: '2rem', opacity: 0.9 }} />
          <div className="loader-bar-outer">
            <div className="loader-bar-inner" style={{ width: `${Math.floor((loadedFrames / TOTAL_FRAMES) * 100)}%` }} />
          </div>
          <p style={{ color: '#666', marginTop: '1.5rem', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Loading Experience</p>
        </div>
      )}

      {/* ─── NAVBAR ─── */}
      <header>
        <nav className="site-nav" aria-label="Main navigation">
          <img src={logoImg} alt="Invasive Species Brewing" className="nav-logo" />
          <ul className="nav-links">
            <li><a href="#story">About</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#food-trucks">Food Trucks</a></li>
            <li><a href="#visit">Visit</a></li>
            <li><a href="#photos">Photos</a></li>
            <li><a href="#press">Press</a></li>
            <li><Link to="/shop" className="nav-cta">Brew Shop</Link></li>
            <li><Link to="/passport" className="nav-cta" style={{ background: 'rgba(57,255,20,0.12)', color: '#39FF14', border: '1px solid rgba(57,255,20,0.3)' }}>Beer Passport</Link></li>
          </ul>
          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span /><span /><span />
          </button>
        </nav>

        {/* ─── MOBILE DRAWER ─── */}
        {menuOpen && <div className="nav-drawer-overlay" onClick={() => setMenuOpen(false)} />}
        <div id="mobile-nav-drawer" className={`nav-drawer ${menuOpen ? 'nav-drawer-open' : ''}`} aria-label="Mobile navigation">
          <button className="nav-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation menu">✕</button>
          <ul className="nav-drawer-links">
            {[['#story','About'],['#menu','Menu'],['#food-trucks','Food Trucks'],['#visit','Visit'],['#photos','Photos'],['#press','Press']].map(([href, label]) => (
              <li key={href}><a href={href} onClick={() => setMenuOpen(false)}>{label}</a></li>
            ))}
            <li>
              <Link to="/shop" onClick={() => setMenuOpen(false)} className="nav-cta">
                Brew Shop
              </Link>
            </li>
            <li>
              <Link
                to="/passport"
                onClick={() => setMenuOpen(false)}
                style={{ color: '#39FF14' }}
              >
                🛂 Beer Passport
              </Link>
            </li>
          </ul>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Invasive+Species+Brewing,726+NE+2nd+Ave,Fort+Lauderdale,FL+33304"
            target="_blank"
            rel="noreferrer"
            className="nav-drawer-directions"
            onClick={() => setMenuOpen(false)}
          >
            Get Directions
          </a>
        </div>
      </header>

      <main id="main-content">

      {/* ─── HERO ─── */}
      <section className="hero">
        {/* Alligator — fast up, slight right */}
        <img
          src={alligatorImg}
          alt=""
          className="parallax-img parallax-alligator"
          style={{ transform: `translateY(${scrollY * -0.55}px) translateX(${scrollY * 0.08}px)` }}
        />
        {/* Deer — medium up, slight left */}
        <img
          src={deerImg}
          alt=""
          className="parallax-img parallax-deer"
          style={{ transform: `translateY(${scrollY * -0.32}px) translateX(${scrollY * -0.06}px)` }}
        />
        {/* Cobra — slow up, no diagonal */}
        <img
          src={cobraImg}
          alt=""
          className="parallax-img parallax-cobra"
          style={{ transform: `translateY(${scrollY * -0.18}px)` }}
        />
        {/* Beaver — medium-fast up, slight right */}
        <img
          src={beaverImg}
          alt=""
          className="parallax-img parallax-beaver-hero"
          style={{ transform: `translateY(${scrollY * -0.42}px) translateX(${scrollY * 0.05}px)` }}
        />
        <div className="hero-content">
          <p className="hero-eyebrow">Fort Lauderdale, FL</p>
          <img src={taglineImg} alt="Invasive Species Brewing + Distilling" style={{ maxWidth: '840px', width: '100%', filter: 'sepia(1) saturate(2.2) hue-rotate(345deg) brightness(0.75) contrast(1.2)' }} />
          <p className="hero-sub">South Florida's premier destination for craft beer &amp; spirits.</p>
          <a href="#menu" className="cta-btn">Explore the Menu</a>
        </div>
        <div className="scroll-nudge">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ─── SCROLL VIDEO SECTION ─── */}
      <div className="scroll-container" ref={scrollContainerRef}>
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} className="video-canvas" aria-hidden="true" />

          {/* Ingredient Tags — left side */}
          <div className={`ingredient-wrap ing-1 ${currentFrame > 25 ? 'visible' : ''}`}>
            <div className="ingredient-tag">
              <span className="tag-text">AROMATIC HOPS</span>
              <div className="tag-line" />
            </div>
          </div>
          <div className={`ingredient-wrap ing-2 ${currentFrame > 50 ? 'visible' : ''}`}>
            <div className="ingredient-tag">
              <span className="tag-text">LOCAL MALT</span>
              <div className="tag-line" />
            </div>
          </div>
          <div className={`ingredient-wrap ing-3 ${currentFrame > 72 ? 'visible' : ''}`}>
            <div className="ingredient-tag">
              <span className="tag-text">FLORIDA CITRUS</span>
              <div className="tag-line" />
            </div>
          </div>

          {/* Ingredient Tags — right side */}
          <div className={`ingredient-wrap ing-r1 ${currentFrame > 35 ? 'visible' : ''}`}>
            <div className="ingredient-tag tag-right">
              <div className="tag-line tag-line-left" />
              <span className="tag-text">YEAST CULTURE</span>
            </div>
          </div>
          <div className={`ingredient-wrap ing-r2 ${currentFrame > 62 ? 'visible' : ''}`}>
            <div className="ingredient-tag tag-right">
              <div className="tag-line tag-line-left" />
              <span className="tag-text">PURE WATER</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STATS BAR ─── */}
      <section className="stats-bar" ref={statsRef}>
        <div className="stat-item">
          <RolodexText text="24" baseDelay={0} visible={statsVisible} />
          <span className="stat-label">Unique Varieties</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <RolodexText text="7" baseDelay={0.25} visible={statsVisible} />
          <span className="stat-label">Days A Week</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <RolodexText text="Ft. Lauderdale" baseDelay={0.45} style={{ fontSize: '2.5rem' }} visible={statsVisible} />
          <span className="stat-label">Heart of Florida</span>
        </div>
      </section>

      {/* ─── STORY ─── */}
      <section id="story" className="story-section" ref={storyRef}>
        <img
          src={alligator2Img}
          alt=""
          className="story-alligator"
          loading="lazy"
          style={{ transform: `translateY(calc(-50% + ${storyRelY * -0.18}px))` }}
        />
        <div className="story-grid">
          <div className="story-left">
            <h2>The Spirit<br /><span style={{ color: accentColor }}>of Florida.</span></h2>
          </div>
          <div className="story-right">
            <p>Owned and operated by native brewers, Invasive Species is the premier destination for South Florida beer and spirits. From ice cold crispy boys to flaming beer spikes, we showcase 24 varieties of juicy IPAs, fruity sours, and unique styles you won't find anywhere else.</p>
            <p>Local Brewers Phil Gillis, who trained at Germany's most prestigious brewing school, and Josh Levitt, who has decades of experience at some of South Florida's largest breweries, are born and raised in South Florida.</p>
            <p>Invasive Species Spirits like the <strong style={{ color: '#fff' }}>High Rye Bourbon</strong>, <strong style={{ color: '#fff' }}>Florida Double Barrel Aged Rum</strong>, and <strong style={{ color: '#fff' }}>Sugarcane Vodka</strong> are the backbone of a diverse cocktail menu featuring signature drinks like the <strong style={{ color: '#fff' }}>Nitro Cuban Espresso Martini</strong> and <strong style={{ color: '#fff' }}>Banana Fosters Old Fashioned</strong>.</p>
            <p>The vibe is as original as the offerings are unique — a reflection of the Florida lifestyle that embodies the spirit of natural history. It lets you know you've entered the heart of Florida.</p>
          </div>
        </div>
      </section>

      {/* ─── BEER MENU ─── */}
      <section id="menu" className="menu-section" ref={menuRef}>
        <div className="menu-header">
          <p className="section-eyebrow">Rotating Selection</p>
          <h2>Beer <span style={{ color: accentColor }}>Menu</span></h2>
          <p className="menu-subhead">24 varieties of craft beer, sours, lagers & spirits. Rotating daily.</p>
        </div>
        {Object.entries(beerMenu).map(([category, items]) => (
          <div key={category} className="menu-category">
            <h3 className="menu-cat-title">{category}</h3>
            <div className="menu-items-grid">
              {items.map((item) => (
                <div key={item.name} className="menu-item-card">
                  <div className="menu-item-top">
                    <span className="menu-item-name">{item.name}</span>
                    <span className="menu-item-price" style={{ color: accentColor }}>{item.price}</span>
                  </div>
                  <p className="menu-item-desc">{item.desc}</p>
                  {item.abv && <span className="menu-item-abv">{item.abv}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}

      </section>

      {/* ─── BIRD OF PARADISE BREAK ─── */}
      <div className="plant-break">
        <img
          src={birdOfParadiseImg}
          alt=""
          className="plant-break-img"
          loading="lazy"
          style={{ transform: `translateY(${menuRelY * -0.14}px)` }}
        />
      </div>

      {/* ─── FOOD TRUCKS ─── */}
      <section id="food-trucks" className="food-trucks-section">
        <p className="section-eyebrow">On Site Every Day</p>
        <h2>Food Trucks<br /><span style={{ color: accentColor }}>Always Here.</span></h2>
        <div className="trucks-grid">
          {trucks.map(truck => (
            <div
              key={truck.id}
              className="truck-card"
              onClick={() => setSelectedTruck(truck)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTruck(truck); } }}
              aria-label={`${truck.name} — ${truck.days}${truck.note ? `, ${truck.note}` : ''}. Tap for details.`}
            >
              <div className="truck-day" style={{ color: accentColor }}>{truck.days}</div>
              <div className="truck-name">{truck.name}</div>
              {truck.note && <div className="truck-note">{truck.note}</div>}
              <div className="truck-tap" aria-hidden="true">Tap for details →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOD TRUCK POPUP ─── */}
      {selectedTruck && (
        <div className="truck-overlay" role="dialog" aria-modal="true" aria-label={`${selectedTruck.name} details`} onClick={() => setSelectedTruck(null)}>
          <div className="truck-popup" onClick={e => e.stopPropagation()}>
            <button className="truck-popup-close" onClick={() => setSelectedTruck(null)} aria-label="Close popup">✕</button>

            {/* Video or image grid */}
            {selectedTruck.video ? (
              <div className="truck-popup-video">
                <iframe
                  src={selectedTruck.video}
                  frameBorder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={selectedTruck.name}
                />
              </div>
            ) : (
              <div className={`truck-popup-imgs truck-popup-imgs-${selectedTruck.images.length}`}>
                {selectedTruck.images.map((src, i) => (
                  <div key={i} className="truck-popup-img-wrap">
                    <img src={src} alt={`${selectedTruck.name} food photo ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="truck-popup-body">
              <div className="truck-popup-meta">
                <span className="truck-popup-days" style={{ color: accentColor }}>{selectedTruck.days}{selectedTruck.note ? ` · ${selectedTruck.note}` : ''}</span>
              </div>
              <h3 className="truck-popup-name">{selectedTruck.name}</h3>
              <p className="truck-popup-tagline">{selectedTruck.tagline}</p>
              <p className="truck-popup-story">{selectedTruck.story}</p>

              <div className="truck-popup-menu">
                <span className="truck-popup-menu-label">On the Menu</span>
                <div className="truck-popup-menu-items">
                  {selectedTruck.menu.map(item => (
                    <span key={item} className="truck-menu-pill">{item}</span>
                  ))}
                </div>
              </div>

              <div className="truck-popup-links">
                {selectedTruck.website && (
                  <a href={selectedTruck.website} target="_blank" rel="noreferrer" className="truck-link-btn truck-link-primary">Visit Website</a>
                )}
                <a href={selectedTruck.instagram} target="_blank" rel="noreferrer" className="truck-link-btn truck-link-secondary">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BERRY ─── */}
      <img
        src={berryImg}
        alt=""
        className="menu-plant menu-plant-right"
        loading="lazy"
        style={{ transform: `translateY(calc(-30% + ${menuRelY * -0.22}px))` }}
      />

      {/* ─── VISIT ─── */}
      <section id="visit" className="visit-section">
        <div className="visit-grid">
          <div className="visit-info">
            <p className="section-eyebrow">Come Find Us</p>
            <h2 className="visit-heading">Visit The<br /><span style={{ color: accentColor }}>Taproom</span></h2>
            <address className="visit-address">726 NorthEast 2nd Ave<br />Fort Lauderdale, FL 33304</address>
            <div className="hours-table">
              <div className="hours-row"><span>Mon – Thu</span><span>5pm – 11pm</span></div>
              <div className="hours-row"><span>Fri – Sat</span><span>2pm – 1am</span></div>
              <div className="hours-row"><span>Sunday</span><span>12pm – 9pm</span></div>
              <div className="hours-row"><span>Billy's Kitchen</span><span>Wed – Sun</span></div>
            </div>
            <p className="visit-events">Taproom available for private events &amp; parties.<br />
              <a href="mailto:invasivespeciesbrewing@gmail.com" style={{ color: accentColor }}>invasivespeciesbrewing@gmail.com</a>
            </p>
          </div>
          <div className="visit-map">
            <iframe
              title="Taproom Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3582.7735783066753!2d-80.14385968495783!3d26.132511183485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d900b2b88fdbf1%3A0x3e39d3fc7e78b6c6!2sInvasive%20Species%20Brewing!5e0!3m2!1sen!2sus!4v1627845600000!5m2!1sen!2sus"
              width="100%"
              height="350"
              style={{ border: 0, borderRadius: '16px', filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
            />
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Invasive+Species+Brewing,726+NE+2nd+Ave,Fort+Lauderdale,FL+33304"
              target="_blank"
              rel="noreferrer"
              className="cta-btn"
              style={{ display: 'block', textAlign: 'center', marginTop: '1.25rem' }}
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* ─── PRESS ─── */}
      <section id="press" className="press-section">
        <p className="section-eyebrow">As Seen In</p>
        <h2>Press</h2>
        <div className="press-grid">
          {[
            { pub: 'Miami New Times', title: 'Best Brewery in Broward 2025', url: 'https://www.miaminewtimes.com/best-of-miami/2025/eat-and-drink/best-brewery-broward-23480163', img: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/ww-media/mediaserver/mia/2025-26/bom25-762x431.webp' },
            { pub: 'Forbes', title: 'No One Laughs Anymore At The Florida Craft Beer Scene', url: 'https://www.forbes.com/sites/garystoller/2019/09/25/no-one-laughs-anymore-at-the-florida-craft-beer-scene/', img: 'https://floridabeerblog.wordpress.com/wp-content/uploads/2018/07/20180720_181255.jpg' },
            { pub: 'ESPN SW Florida', title: 'The 10 Best Breweries in Florida', url: 'https://espnswfl.com/listicle/the-10-best-breweries-in-florida/', img: 'https://floridabeerblog.wordpress.com/wp-content/uploads/2018/07/20180720_181400.jpg' },
            { pub: 'Miami New Times', title: 'Best Breweries in Miami and Fort Lauderdale 2022', url: 'https://www.miaminewtimes.com/restaurants/best-of-miami-2022-the-best-breweries-in-miami-and-fort-lauderdale-14739980', img: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/ww-media/mediaserver/mia/2022-25/best_miami_brewery_photo_courtesy_of_tripping_animals_of_i-2.webp' },
            { pub: 'Thrillist', title: 'The 10 Best Breweries in Florida Ranked', url: 'https://www.thrillist.com/drink/miami/the-10-best-breweries-in-florida-ranked', img: 'https://floridabeerblog.wordpress.com/wp-content/uploads/2018/07/20180720_181435.jpg' },
            { pub: 'Forbes', title: '10 Under the Radar Breweries to Watch This Spring', url: 'https://www.forbes.com/sites/kennygould/2019/03/08/best-craft-beer-spring-2019/', img: 'https://floridabeerblog.wordpress.com/wp-content/uploads/2018/07/20180720_181315.jpg' },
            { pub: 'New Times Broward', title: 'Invasive Species Offers Experimental Beers at Ft. Lauderdale Brewery', url: 'http://www.miaminewtimes.com/restaurants/invasive-species-brewing-offers-experimental-beers-at-fort-lauderdale-brewery-9504216', img: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/ww-media/mediaserver/mia/2017-29/unnamed-11.webp' },
            { pub: 'Miami New Times', title: 'Best New Brewery in Broward 2022', url: 'https://www.miaminewtimes.com/best-of/2022/eat-and-drink/best-new-brewery-miami-14715459', img: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/ww-media/mediaserver/mia/2022-24/bom-mnt_06-23-22.webp' },
            { pub: 'Sun Sentinel', title: 'Best New Brewery in South Florida 2017', url: 'http://www.southflorida.com/best-of-south-florida/bars-clubs-entertainment/sf-best-new-brewery-south-florida-invasive-species-20171129-story.html', img: 'https://floridabeerblog.wordpress.com/wp-content/uploads/2018/07/20180720_181329.jpg' },
            { pub: 'Fort Lauderdale Daily', title: "Invasive Species Promises to Be Ft. Lauderdale's Funkiest New Brewery", url: 'http://www.miaminewtimes.com/restaurants/invasive-species-brewing-offers-experimental-beers-at-fort-lauderdale-brewery-9504216', img: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/ww-media/mediaserver/mia/2017-29/unnamed-11.webp' },
          ].map(({ pub, title, url, img }) => (
            <a key={url + title} href={url} target="_blank" rel="noreferrer" className={`press-card${img ? ' press-card-has-img' : ''}`}>
              {img && <div className="press-img-wrap"><img src={img} alt={title} loading="lazy" /></div>}
              <div className="press-text">
                <span className="press-pub">{pub}</span>
                <p className="press-title">{title}</p>
                <span className="press-read">Read Article →</span>
              </div>
            </a>
          ))}
        </div>
      </section>


      {/* ─── PHOTOS ─── */}
      <section id="photos" className="photos-section">
        <p className="section-eyebrow">The Taproom</p>
        <h2>Photos</h2>
        <div className="photos-grid">
          {photos.map((src, i) => (
            <div
              key={i}
              className={`photo-item photo-item-${i + 1}`}
              onClick={() => openLightbox(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } }}
              aria-label={`View taproom photo ${i + 1} in full screen`}
            >
              <img src={src} alt={`Invasive Species Brewing taproom photo ${i + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* ─── LIGHTBOX ─── */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" role="dialog" aria-modal="true" aria-label={`Photo ${lightboxIndex + 1} of ${photos.length}`} onClick={closeLightbox}>
          <button className="lightbox-arrow lightbox-prev" onClick={prevPhoto} aria-label="Previous photo">&#8592;</button>
          <img className="lightbox-img" src={photos[lightboxIndex]} alt={`Invasive Species Brewing taproom photo ${lightboxIndex + 1} of ${photos.length}`} />
          <button className="lightbox-arrow lightbox-next" onClick={nextPhoto} aria-label="Next photo">&#8594;</button>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">&#10005;</button>
        </div>
      )}

      {/* ─── EMAIL SIGNUP ─── */}
      <section className="email-section">
        <h2>Join The <span style={{ color: accentColor }}>Club</span></h2>
        <p>Be the first to know when we release limited edition brews.</p>
        <form className="email-form" onSubmit={(e) => {
          e.preventDefault();
          const url = import.meta.env.VITE_EMAIL_ENDPOINT;
          if (!url || !emailInput) return;
          setEmailStatus(null);
          fetch(url, { method: 'POST', body: JSON.stringify({ email: emailInput }) })
            .then(() => { setEmailStatus('success'); setEmailInput(''); })
            .catch(() => setEmailStatus('error'));
        }}>
          <label htmlFor="email-signup" className="sr-only">Email address</label>
          <input
            id="email-signup"
            type="email"
            placeholder="your@email.com"
            value={emailInput}
            onChange={(e) => { setEmailInput(e.target.value); setEmailStatus(null); }}
            className="email-input"
            autoComplete="email"
          />
          <button type="submit" className="email-submit" style={{ background: accentColor, color: '#000' }}>Send</button>
        </form>
        {emailStatus === 'success' && <p style={{ color: accentColor, marginTop: '1rem' }}>You're in. Thanks!</p>}
        {emailStatus === 'error' && <p style={{ color: '#ff4444', marginTop: '1rem' }}>Something went wrong. Try again.</p>}
      </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="site-footer">
        <div className="footer-top">
          <img src={logoImg} alt="Invasive Species Brewing" style={{ height: '60px', opacity: 0.7 }} />
          <nav className="footer-nav" aria-label="Footer navigation">
            <a href="https://invasivespeciesbrewing.com/our-story" target="_blank" rel="noreferrer">About</a>
            <Link to="/shop">Brew Shop</Link>
            <a href="https://invasivespeciesbrewing.com/menu-6-26" target="_blank" rel="noreferrer">Menu</a>
            <a href="#photos">Photos</a>
            <a href="#press">Press</a>
            <a href="https://invasivespeciesbrewing.com/contact" target="_blank" rel="noreferrer">Contact</a>
          </nav>
          <div className="footer-social">
            <a href="https://www.facebook.com/invasivespeciesbrewing/" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://www.instagram.com/invasivespeciesbrewing" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
        <div className="footer-bottom">
          <address style={{ fontStyle: 'normal' }}>726 NorthEast 2nd Ave, Fort Lauderdale, FL 33304</address>
          <p style={{ marginTop: '0.75rem' }}>
            <a href="https://invasivespeciesbrewing.com/return-policy" style={{ color: '#808080' }}>Return Policy</a>
            <span style={{ margin: '0 1rem', color: '#555' }}>|</span>
            <a href="https://invasivespeciesbrewing.com/privacy-policy" style={{ color: '#808080' }}>Privacy Policy</a>
          </p>
          <p style={{ marginTop: '1.5rem', color: '#808080', fontSize: '0.8rem' }}>Copyright 2026 © All rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ScrollStopSite;
