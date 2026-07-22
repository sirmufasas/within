'use client';
import React from 'react';

interface WithinBrandingProps {
  variant?: 'inline' | 'footer' | 'topbar';
  className?: string;
}

// Original WITH-IN X logo badge using the uploaded image
function WithinLogoBadge({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center within-gradient rounded flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src="/assets/images/IMG-20260712-WA0001-1784701905533.jpg"
        alt="WITH-IN"
        style={{ width: size * 0.8, height: size * 0.8, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
      />
    </span>
  );
}

export default function WithinBranding({ variant = 'inline', className = '' }: WithinBrandingProps) {
  if (variant === 'footer') {
    return (
      <div className={`flex items-center justify-center gap-1.5 text-xs text-muted-foreground ${className}`}>
        <span>Powered by</span>
        <WithinLogoBadge size={16} />
        <span className="font-semibold text-primary">WITH-IN</span>
        <span>© 2026</span>
      </div>
    );
  }

  if (variant === 'topbar') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs text-muted-foreground">Powered by</span>
        <WithinLogoBadge size={16} />
        <span className="text-xs font-semibold text-primary">WITH-IN</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <WithinLogoBadge size={20} />
      <span className="text-xs font-medium text-muted-foreground">
        Powered by <span className="text-primary font-semibold">WITH-IN</span>
      </span>
    </div>
  );
}