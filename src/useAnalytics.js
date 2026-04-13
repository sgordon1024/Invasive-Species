import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

// Swap placeholder script src with real measurement ID
function initGA() {
  if (!GA_ID) return;
  const el = document.getElementById('ga-script');
  if (el) el.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  gtag('config', GA_ID, { send_page_view: false });
}

// ── Public helpers ──────────────────────────────────────────────

export function trackEvent(name, params = {}) {
  if (!GA_ID) return;
  gtag('event', name, params);
}

export function trackPageView(path, title) {
  if (!GA_ID) return;
  gtag('event', 'page_view', { page_path: path, page_title: title });
}

// ── Hook: automatic page-view on route change ───────────────────

export default function useAnalytics() {
  const location = useLocation();
  const initialised = useRef(false);

  useEffect(() => {
    if (!initialised.current) {
      initGA();
      initialised.current = true;
    }
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.hash, document.title);
  }, [location]);
}
