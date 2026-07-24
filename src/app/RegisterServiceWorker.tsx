'use client';
import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Installability/offline support is a progressive enhancement —
        // never block or break the app if registration fails.
      });
    }
  }, []);
  return null;
}
