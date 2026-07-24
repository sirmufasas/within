'use client';
import React from 'react';

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

/**
 * Full-screen branded loading overlay. Use for moments where the user is
 * waiting on something important (signing in, signing up, submitting an
 * order) so the app never looks like it's frozen. The logo rises up from
 * the bottom of the screen into the center and spins continuously while
 * visible.
 */
export default function LoadingOverlay({ show, message }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-white/85 backdrop-blur-sm loader-backdrop">
      <div className="loader-rise">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/loader-logo.png"
          alt="Loading"
          className="w-16 h-16 sm:w-20 sm:h-20 loader-spin drop-shadow-lg"
        />
      </div>
      {message && (
        <p className="loader-rise text-sm font-medium text-muted-foreground" style={{ animationDelay: '100ms' }}>
          {message}
        </p>
      )}
    </div>
  );
}
