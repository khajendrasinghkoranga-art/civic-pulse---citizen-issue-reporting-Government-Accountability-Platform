'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage, LanguageSwitcherButton } from '@/hooks/useLanguage';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Activity,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { label: t('nav_dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav_report'), href: '/report', icon: FilePlus2 },
    { label: t('nav_issues'), href: '/issues', icon: ClipboardList },
    { label: t('nav_community'), href: '/community', icon: MessageSquare },
    { label: t('nav_transparency'), href: '/transparency', icon: ShieldCheck },
  ];

  if (!isAuthenticated) return null;

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <Link href="/dashboard" className="landing-logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <img
            src="/civicpulse-logo.png"
            alt="CivicPulse"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="app-nav-desktop">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`app-nav-link ${isActive ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Switcher */}
          <LanguageSwitcherButton />

          <Link href="/notifications" className="btn btn-icon btn-ghost notification-btn" title={t('nav_notifications')}>
            <Bell size={18} />
          </Link>

          {/* Profile dropdown */}
          <div className="profile-dropdown-wrap">
            <button
              className="avatar"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="User menu"
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </button>
            {profileOpen && (
              <>
                <div className="profile-backdrop" onClick={() => setProfileOpen(false)}></div>
                <div className="profile-dropdown glass-card">
                  <div className="profile-dropdown-header">
                    <div className="avatar avatar-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="profile-dropdown-name">{user?.name}</div>
                      <div className="profile-dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <hr className="divider" />
                  <Link
                    href="/profile"
                    className="profile-dropdown-item"
                    onClick={() => setProfileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/notifications"
                    className="profile-dropdown-item"
                    onClick={() => setProfileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Bell size={16} />
                    <span>Notifications</span>
                  </Link>
                  <hr className="divider" />
                  <button
                    className="profile-dropdown-item profile-dropdown-logout"
                    onClick={() => { logout(); setProfileOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Prominent Direct Logout Button */}
          <button
            onClick={() => logout()}
            className="btn btn-ghost logout-nav-btn"
            title="Log Out"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#dc2626',
              fontWeight: 600,
              fontSize: '0.82rem',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              background: '#fef2f2',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s'
            }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>

          {/* Mobile toggle */}
          <button
            className="btn btn-icon btn-ghost mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="app-nav-mobile glass-card">
          <div style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t('nav_language')}:</span>
            <LanguageSwitcherButton />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`app-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => { logout(); setMenuOpen(false); }}
            className="app-nav-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#dc2626',
              background: '#fef2f2',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              marginTop: '0.5rem',
              borderRadius: '8px'
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      )}
    </header>
  );
}
