'use client';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_PRIMARY = '#4F46E5';

/**
 * The whole app's `bg-primary` / `text-primary` / `border-primary` / `.btn-primary`
 * classes read from the CSS variable `--primary` (see tailwind.config.js and
 * styles/tailwind.css). This component keeps that variable in sync with the
 * signed-in business's chosen theme color, so picking a theme at signup (or
 * changing it later in Settings) reflects everywhere automatically — no
 * per-page work needed.
 */
export default function ThemeSync() {
  const { business } = useAuth();

  useEffect(() => {
    const color = business?.primary_color || DEFAULT_PRIMARY;
    document.documentElement.style.setProperty('--primary', color);
  }, [business?.primary_color]);

  return null;
}
