// src/index.js — TO‘G‘RI VA FINAL VERSIYA

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// React Router — BU YERGA QO‘SHILDI!
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>  {/* Faqat bitta joyda — shu yerda! */}
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);