import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import useAnalytics from './useAnalytics';

const ScrollStopSite = lazy(() => import('./ScrollStop'));
const ShopPage = lazy(() => import('./ShopPage'));
const CarouserClubPage = lazy(() => import('./CarouserClubPage'));
const CarouserPitch = lazy(() => import('./CarouserPitch'));

function LoadingFallback() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#39FF14', fontFamily: 'sans-serif', fontSize: '1rem', letterSpacing: '0.2em' }}>LOADING…</div>
    </div>
  );
}

function AppRoutes() {
  useAnalytics();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<ScrollStopSite />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/carouser-club" element={<CarouserClubPage />} />
        <Route path="/carouser-pitch" element={<CarouserPitch />} />
        <Route path="*" element={<ScrollStopSite />} />
      </Routes>
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>,
);
