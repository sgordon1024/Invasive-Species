import { useEffect, useRef, useState } from 'react';
import './ScrollStop.css';
import alligatorImg from './assets/alligator.png';
import alligator2Img from './assets/alligator-2.png';
import beaverImg from './assets/beaver.png';
import birdOfParadiseImg from './assets/Bird of Paradise.png';
import berryImg from './assets/berry.png';
import cobraImg from './assets/cobra.png';
import deerImg from './assets/deer.png';

const TOTAL_FRAMES = 121;

const ACCENT = '#39FF14';

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
      // Video finishes scrubbing in the first 30% of total scroll
      const maxVideoScroll = (html.scrollHeight - window.innerHeight) * 0.3;
      const scrollFraction = Math.max(0, Math.min(1, scrollProgress / maxVideoScroll));
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

  const beerMenu = {
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

  return (
    <div className="site-root">
      {/* Loader */}
      {loadedFrames < TOTAL_FRAMES && (
        <div className="loader">
          <img src="https://invasivespeciesbrewing.com/wp-content/uploads/2020/07/iguana-white-invasive-species-brewing.png" alt="Logo" style={{ height: '80px', marginBottom: '2rem', opacity: 0.9 }} />
          <div className="loader-bar-outer">
            <div className="loader-bar-inner" style={{ width: `${Math.floor((loadedFrames / TOTAL_FRAMES) * 100)}%` }} />
          </div>
          <p style={{ color: '#666', marginTop: '1.5rem', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Loading Experience</p>
        </div>
      )}

      {/* ─── NAVBAR ─── */}
      <nav className="site-nav">
        <img src="https://invasivespeciesbrewing.com/wp-content/uploads/2020/07/iguana-white-invasive-species-brewing.png" alt="Invasive Species Brewing" className="nav-logo" />
        <ul className="nav-links">
          <li><a href="#story">About</a></li>
          <li><a href="#menu">Menu</a></li>
          <li><a href="#food-trucks">Food Trucks</a></li>
          <li><a href="#visit">Visit</a></li>
          <li><a href="https://invasivespeciesbrewing.com/brew-shop" target="_blank" rel="noreferrer" className="nav-cta">Brew Shop</a></li>
        </ul>
      </nav>

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
          <h1>A New Breed<br /><span style={{ color: accentColor }}>Of Beers</span></h1>
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
          <canvas ref={canvasRef} className="video-canvas" />

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
        {/* Berry — right edge */}
        <img
          src={berryImg}
          alt=""
          className="menu-plant menu-plant-right"
          style={{ transform: `translateY(calc(-30% + ${menuRelY * -0.22}px))` }}
        />
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
          style={{ transform: `translateY(${menuRelY * -0.14}px)` }}
        />
      </div>

      {/* ─── FOOD TRUCKS ─── */}
      <section id="food-trucks" className="food-trucks-section">
        <p className="section-eyebrow">On Site Every Day</p>
        <h2>Food Trucks<br /><span style={{ color: accentColor }}>Always Here.</span></h2>
        <div className="trucks-grid">
          <div className="truck-card">
            <div className="truck-day" style={{ color: accentColor }}>Mon – Tue</div>
            <div className="truck-name">Tight Lines Food Shack</div>
          </div>
          <div className="truck-card">
            <div className="truck-day" style={{ color: accentColor }}>Wed – Sat</div>
            <div className="truck-name">Billy's Curbside Kitchen</div>
          </div>
          <div className="truck-card">
            <div className="truck-day" style={{ color: accentColor }}>Sunday</div>
            <div className="truck-name">La Condesa Taqueria</div>
            <div className="truck-note">Starts at noon</div>
          </div>
        </div>
      </section>

      {/* ─── VISIT ─── */}
      <section id="visit" className="visit-section">
        <div className="visit-grid">
          <div className="visit-info">
            <p className="section-eyebrow">Come Find Us</p>
            <h2 className="visit-heading">Visit The<br /><span style={{ color: accentColor }}>Taproom</span></h2>
            <p className="visit-address">726 NorthEast 2nd Ave<br />Fort Lauderdale, FL 33304</p>
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

      {/* ─── EMAIL SIGNUP ─── */}
      <section className="email-section">
        <h2>Join The <span style={{ color: accentColor }}>Club</span></h2>
        <p>Be the first to know when we release limited edition brews.</p>
        <form className="email-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="your@email.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="email-input"
          />
          <button type="submit" className="email-submit" style={{ background: accentColor, color: '#000' }}>Send</button>
        </form>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="site-footer">
        <div className="footer-top">
          <img src="https://invasivespeciesbrewing.com/wp-content/uploads/2020/07/iguana-white-invasive-species-brewing.png" alt="Invasive Species Brewing" style={{ height: '60px', opacity: 0.7 }} />
          <nav className="footer-nav">
            <a href="https://invasivespeciesbrewing.com/our-story" target="_blank" rel="noreferrer">About</a>
            <a href="https://invasivespeciesbrewing.com/brew-shop" target="_blank" rel="noreferrer">Brew Shop</a>
            <a href="https://invasivespeciesbrewing.com/menu-6-26" target="_blank" rel="noreferrer">Menu</a>
            <a href="https://invasivespeciesbrewing.com/photos" target="_blank" rel="noreferrer">Photos</a>
            <a href="https://invasivespeciesbrewing.com/home-2" target="_blank" rel="noreferrer">Press</a>
            <a href="https://invasivespeciesbrewing.com/contact" target="_blank" rel="noreferrer">Contact</a>
          </nav>
          <div className="footer-social">
            <a href="https://www.facebook.com/invasivespeciesbrewing/" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://www.instagram.com/invasivespeciesbrewing" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>726 NorthEast 2nd Ave, Fort Lauderdale, FL 33304</p>
          <p style={{ marginTop: '0.75rem' }}>
            <a href="https://invasivespeciesbrewing.com/return-policy" style={{ color: '#555' }}>Return Policy</a>
            <span style={{ margin: '0 1rem', color: '#333' }}>|</span>
            <a href="https://invasivespeciesbrewing.com/privacy-policy" style={{ color: '#555' }}>Privacy Policy</a>
          </p>
          <p style={{ marginTop: '1.5rem', color: '#404040', fontSize: '0.8rem' }}>Copyright 2026 © All rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ScrollStopSite;
