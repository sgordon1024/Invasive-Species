import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ScrollStopSite from './ScrollStop';
import { PassportProvider } from './passport/PassportContext';
import ProtectedRoute from './passport/ProtectedRoute';

const ShopPage = lazy(() => import('./ShopPage'));

// Lazy-load passport pages so they don't bloat the main bundle.
const BeerPassportLanding = lazy(() => import('./passport/BeerPassportLanding'));
const PassportAuth        = lazy(() => import('./passport/PassportAuth'));
const PassportProfile     = lazy(() => import('./passport/PassportProfile'));
const CheckIn             = lazy(() => import('./passport/CheckIn'));
const StaffPortal         = lazy(() => import('./passport/StaffPortal'));

// Thin loading fallback shown while lazy chunks load.
const PageLoader = () => (
  <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: 36, height: 36,
      border: '3px solid #1a1a1a',
      borderTopColor: '#39FF14',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      BrowserRouter basename must match Vite's `base` config.
      Change this if you change the base path in vite.config.js.
    */}
    <BrowserRouter basename="/Invasive-Species">
      <PassportProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Main brewery website ───────────────────────────── */}
            <Route path="/" element={<ScrollStopSite />} />
            <Route path="/shop" element={<ShopPage />} />

            {/* ── Beer Passport public pages ─────────────────────── */}
            <Route path="/passport"       element={<BeerPassportLanding />} />
            <Route path="/passport/login" element={<PassportAuth />} />

            {/* Check-in page — auth check happens inside the component
                so we can redirect to login while preserving the token. */}
            <Route path="/checkin" element={<CheckIn />} />

            {/* ── Protected: logged-in users ─────────────────────── */}
            <Route
              path="/passport/profile"
              element={
                <ProtectedRoute>
                  <PassportProfile />
                </ProtectedRoute>
              }
            />

            {/* ── Protected: staff only ──────────────────────────── */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute requireStaff>
                  <StaffPortal />
                </ProtectedRoute>
              }
            />

            {/* 404 fallback */}
            <Route path="*" element={<ScrollStopSite />} />
          </Routes>
        </Suspense>
      </PassportProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
