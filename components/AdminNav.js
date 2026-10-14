'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ExternalLink } from 'lucide-react';

export default function AdminNav() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/admin');
    }
  };

  return (
    <header style={{
      background: '#05080e',
      borderBottom: '1px solid #162334',
      padding: '14px 0',
      color: '#ffffff'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/admin/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#00ff66',
            textDecoration: 'none'
          }}>
            <svg height="28" viewBox="0 0 16 16" version="1.1" width="28" fill="#00ff66" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <div>
              <span style={{ fontWeight: '700', fontSize: '17px', letterSpacing: '-0.3px', color: '#00ff66' }}>Certify</span>
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                background: 'rgba(0, 255, 102, 0.15)',
                color: '#00ff66',
                border: '1px solid rgba(0, 255, 102, 0.3)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '700'
              }}>
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/portal"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Participant Portal
            <ExternalLink size={14} />
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-secondary btn-sm"
            style={{
              background: '#070c14',
              color: '#8b9cb3',
              borderColor: '#1e314b',
              padding: '6px 14px',
              fontSize: '13px',
              borderRadius: '6px'
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
