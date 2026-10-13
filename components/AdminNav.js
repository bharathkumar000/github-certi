'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  FileSpreadsheet,
  LogOut,
  Shield,
  PlusCircle,
  ExternalLink
} from 'lucide-react';

export default function AdminNav({ userEmail = 'admin@githubworkshop.com' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/admin/login');
    }
  };

  const navLinks = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Sessions', href: '/admin/sessions', icon: CalendarDays },
    { label: 'Activity Logs', href: '/admin/logs', icon: FileSpreadsheet },
  ];

  return (
    <header style={{
      background: '#0d1117',
      borderBottom: '1px solid #30363d',
      padding: '12px 0',
      color: '#ffffff'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/admin/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ffffff',
            textDecoration: 'none'
          }}>
            <svg height="28" viewBox="0 0 16 16" version="1.1" width="28" fill="#ffffff" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <div>
              <span style={{ fontWeight: '700', fontSize: '16px' }}>Certify</span>
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                background: '#8957e5',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                Admin
              </span>
            </div>
          </Link>

          {/* Navigation tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {navLinks.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: active ? '#ffffff' : '#8b949e',
                    backgroundColor: active ? '#21262d' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/portal"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#58a6ff',
              textDecoration: 'none'
            }}
          >
            Participant View
            <ExternalLink size={13} />
          </Link>

          <Link
            href="/admin/sessions/new"
            className="btn btn-primary btn-sm"
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            <PlusCircle size={15} />
            New Session
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-secondary btn-sm"
            style={{
              background: '#21262d',
              color: '#c9d1d9',
              borderColor: '#30363d',
              padding: '6px 12px',
              fontSize: '13px'
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
