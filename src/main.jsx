import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ScrollStopSite from './ScrollStop';
import CarouserClubPage from './CarouserClubPage';
import useAnalytics from './useAnalytics';

function AppRoutes() {
  useAnalytics();
  return (
    <Routes>
      <Route path="/" element={<ScrollStopSite />} />
      <Route path="/carouser-club" element={<CarouserClubPage />} />
      <Route path="*" element={<ScrollStopSite />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>,
);
