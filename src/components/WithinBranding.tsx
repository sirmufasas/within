'use client';
import React from 'react';

interface WithinBrandingProps {
  variant?: 'inline' | 'footer' | 'topbar';
  className?: string;
}

function WithinLogoBadge({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #312E81 0%, #4F46E5 40%, #6366F1 100%)',
      }}
    >
      <img
        src="/assets/images/download-1784730896538.png"
        alt="WITH-IN"
        style={{ width: size * 0.8, height: size * 0.8, objectFit: 'contain' }}
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