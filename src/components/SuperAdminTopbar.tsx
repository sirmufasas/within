'use client';
import React, { useState } from 'react';
import { Bell, ChevronDown, Menu, Shield, LogOut } from 'lucide-react';

interface SuperAdminTopbarProps {
  adminName: string;
  sidebarCollapsed: boolean;
  onMenuToggle: () => void;
  onSignOut?: () => void;
}

export default function SuperAdminTopbar({ adminName, onMenuToggle, onSignOut }: SuperAdminTopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = adminName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-card border-b border-border flex items-center px-4 gap-3 z-20">
      {/* Mobile Menu */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2.5 rounded-lg hover:bg-muted text-muted-foreground transition-all duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-8 h-8 within-gradient rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">WITH-IN Platform</p>
          <p className="text-xs text-muted-foreground">Super Admin Console</p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-warning rounded-full" />
        </button>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-all duration-150 min-h-[44px]"
          >
            <div className="w-8 h-8 within-gradient rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{adminName}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-modal z-50 fade-in py-1">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{adminName}</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); onSignOut?.(); }}
                className="flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-danger/5 transition-colors duration-150"
              >
                <LogOut size={15} />
                Sign Out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}