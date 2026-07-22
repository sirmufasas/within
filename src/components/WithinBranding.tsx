import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

interface WithinBrandingProps {
  variant?: 'inline' | 'footer' | 'topbar';
  className?: string;
}

export default function WithinBranding({ variant = 'inline', className = '' }: WithinBrandingProps) {
  if (variant === 'footer') {
    return (
      <div className={`flex items-center justify-center gap-1.5 text-xs text-muted-foreground ${className}`}>
        <span>Powered by</span>
        <span className="font-semibold text-primary">WITH-IN</span>
        <span>© 2026</span>
      </div>
    );
  }

  if (variant === 'topbar') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs text-muted-foreground">Powered by</span>
        <span className="text-xs font-semibold text-primary">WITH-IN</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <AppLogo size={20} />
      <span className="text-xs font-medium text-muted-foreground">
        Powered by <span className="text-primary font-semibold">WITH-IN</span>
      </span>
    </div>
  );
}