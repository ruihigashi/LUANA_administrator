// ── モバイルデバッグ用コンソール eruda の読み込み ──
if (import.meta.env.DEV) {
  import('eruda').then(({ default: eruda }) => {
    eruda.init();
  });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then((reg) => {
      console.log('Service Worker registered:', reg.scope);
    })
    .catch((err) => {
      console.error('Service Worker registration failed:', err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
