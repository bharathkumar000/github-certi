'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, KeyRound, AlertCircle, ArrowLeft, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('CERTIFY-ADMIN-2026');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid admin access code. Please check and try again.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An error occurred during authentication. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: '#0d1117', color: '#c9d1d9', minHeight: '100vh' }}>
      <header style={{ padding: '20px 0', borderBottom: '1px solid #21262d' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', textDecoration: 'none' }}>
            <svg height="28" viewBox="0 0 16 16" version="1.1" width="28" fill="#ffffff" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Certify Admin Portal</span>
          </Link>
          <Link href="/" style={{ color: '#8b949e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#161b22',
              border: '1px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#58a6ff'
            }}>
              <KeyRound size={26} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
              Admin Portal Access
            </h1>
            <p style={{ fontSize: '14px', color: '#8b949e', lineHeight: '1.5' }}>
              Enter your admin access code to manage workshop sessions, layouts, and certificates
            </p>
          </div>

          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '32px 28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ color: '#c9d1d9', marginBottom: 0 }}>
                    Admin Access Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setAccessCode('CERTIFY-ADMIN-2026')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#58a6ff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <Sparkles size={13} />
                    Auto-fill Code
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showCode ? 'text' : 'password'}
                    required
                    className="input-text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter admin access code"
                    style={{
                      background: '#0d1117',
                      borderColor: '#30363d',
                      color: '#ffffff',
                      paddingLeft: '38px',
                      paddingRight: '40px',
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      letterSpacing: '1px'
                    }}
                  />
                  <KeyRound size={16} color="#8b949e" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#8b949e',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                    title={showCode ? 'Hide Code' : 'Show Code'}
                  >
                    {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#58a6ff',
                  background: 'rgba(56, 139, 253, 0.1)',
                  border: '1px solid rgba(56, 139, 253, 0.2)',
                  padding: '4px 10px',
                  borderRadius: '16px'
                }}>
                  <ShieldCheck size={13} />
                  Default Access Code: <strong>CERTIFY-ADMIN-2026</strong>
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '8px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying Code...
                  </>
                ) : (
                  <>
                    Sign In to Admin Portal
                    <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#8b949e' }}>
            Protected organizer authentication &bull; Certify Administrator Access Only
          </div>
        </div>
      </main>
    </div>
  );
}
