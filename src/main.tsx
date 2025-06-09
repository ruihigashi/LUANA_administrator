if (import.meta.env.DEV) {
  const VConsole = require('vconsole');
  // @ts-ignore
  new VConsole(); 
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
