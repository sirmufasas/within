'use client';
import React from 'react';

interface WithinBrandingProps {
  variant?: 'inline' | 'footer' | 'topbar';
  className?: string;
}

// Original coded WITH-IN logo badge
function WithinLogoBadge({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center within-gradient rounded font-black text-white tracking-tight leading-none"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      W·IN
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