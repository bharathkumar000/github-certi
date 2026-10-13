import Link from 'next/link';
import { Award, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="page-wrapper" style={{ background: '#f8fafc' }}>
      {/* Top Navigation */}
      <header style={{
        background: '#0d1117',
        borderBottom: '1px solid #30363d',
        padding: '16px 0',
        color: '#ffffff'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="#ffffff" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <div>
              <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.3px', color: '#ffffff' }}>
                Certify
              </span>
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                background: '#21262d',
                color: '#58a6ff',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '600',
                border: '1px solid #30363d'
              }}>
                Portal
              </span>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link
              href="/admin/login"
              style={{
                color: '#8b949e',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
            >
              <ShieldCheck size={16} />
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            padding: '48px 40px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: '#dafbe1',
              color: '#1a7f37',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              <Award size={16} />
              Official Verification & Certificate System
            </div>

            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              letterSpacing: '-1px',
              color: '#0f172a',
              marginBottom: '12px'
            }}>
              Certify
            </h1>
            
            <h2 style={{
              fontSize: '22px',
              fontWeight: '500',
              color: '#475569',
              marginBottom: '24px'
            }}>
              Workshop Certificate Generation Portal
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#64748b',
              maxWidth: '640px',
              margin: '0 auto 36px',
              lineHeight: '1.6'
            }}>
              Welcome to Certify. Participants can enter their designated session access code to instantly generate, preview, and download their official certificate of completion.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '16px'
            }}>
              <Link
                href="/portal"
                className="btn btn-primary btn-lg"
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  borderRadius: '10px'
                }}
              >
                Access Participant Portal
                <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ marginBottom: '36px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#15803d',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: '500'
              }}>
                <Sparkles size={14} color="#16a34a" />
                Demo Access Code ready: <strong>GH-OCT-2026</strong>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '24px 0',
        textAlign: 'center',
        fontSize: '13px',
        color: '#64748b'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            Certify – Workshop Certificate Generation Portal &copy; {new Date().getFullYear()}
          </div>
          <div>
            <Link href="/admin/login" style={{ color: '#64748b', textDecoration: 'none' }}>
              Organizer &amp; Admin Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
