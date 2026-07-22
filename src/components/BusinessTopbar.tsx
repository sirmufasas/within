'use client';
import React, { useState } from 'react';
import { Bell, ChevronDown, Menu, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

import WithinBranding from '@/components/WithinBranding';

interface BusinessTopbarProps {
  businessName: string;
  businessLogo?: string;
  ownerName: string;
  ownerRole: string;
  sidebarCollapsed: boolean;
  onMenuToggle: () => void;
  lastUpdated: string;
  onSignOut?: () => void;
}

export default function BusinessTopbar({
  businessName, businessLogo, ownerName, ownerRole,
  onMenuToggle, onSignOut,
}: BusinessTopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = ownerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-card border-b border-border flex items-center px-4 gap-3 z-20">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2.5 rounded-lg hover:bg-muted text-muted-foreground transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <Menu size={22} />
      </button>

      {/* Business Identity */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 within-gradient rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {businessLogo ? (
            <img src={businessLogo} alt={businessName} className="w-full h-full object-contain" />
          ) : (
            <span className="text-white font-black text-xs tracking-tight leading-none">W·IN</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight truncate">{businessName}</p>
          <WithinBranding variant="topbar" />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-all min-h-[44px]"
          >
            <div className="w-8 h-8 within-gradient rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{ownerName}</p>
              <p className="text-xs text-muted-foreground capitalize">{ownerRole}</p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-50 fade-in py-1">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{ownerName}</p>
                <p className="text-xs text-muted-foreground capitalize">{ownerRole}</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-3 text-sm text-secondary-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings size={15} />
                Business Settings
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-3 text-sm text-secondary-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={15} />
                Profile
              </Link>
              <div className="border-t border-border mt-1">
                <button
                  onClick={() => { setShowUserMenu(false); onSignOut?.(); }}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-danger/5 transition-colors w-full"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}