import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ScrollStopSite from './ScrollStop';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<ScrollStopSite />} />
        <Route path="*" element={<ScrollStopSite />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
