'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowRight, AlertCircle, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ParticipantAccessPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('downloaded') === 'true') {
        setDownloadedNotice(true);
      }
    }
  }, []);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!accessCode.trim()) {
      setError('Please enter your workshop access code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/portal/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed. Please check the code.');
        setLoading(false);
        return;
      }

      // Verification successful -> proceed to certificate workspace
      router.push('/portal/certificate');
    } catch (err) {
      console.error('Code verification error:', err);
      setError('A connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleAutoFillAndSubmit = async (demoCode = 'GH-OCT-2026') => {
    setAccessCode(demoCode);
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/portal/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: demoCode })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed. Please check the code.');
        setLoading(false);
        return;
      }

      router.push('/portal/certificate');
    } catch (err) {
      console.error('Code verification error:', err);
      setError('A connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: '#f8fafc' }}>
      {/* Top Header */}
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
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ffffff',
            textDecoration: 'none'
          }}>
            <svg height="28" viewBox="0 0 16 16" version="1.1" width="28" fill="#ffffff" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Certify Portal</span>
          </Link>
          <Link href="/" style={{ color: '#8b949e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Access Code Card */}
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px' }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.05)',
          padding: '36px 32px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#0969da'
            }}>
              <KeyRound size={26} />
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Enter Session Access Code
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Please enter the code provided by your instructor or session coordinator to unlock your certificate.
            </p>
          </div>

          {downloadedNotice && (
            <div className="alert alert-success" style={{ marginBottom: '20px', fontSize: '13px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Certificate Downloaded!</strong> Your session has ended. To generate another certificate, please enter an access code or use the demo code below.
              </div>
            </div>
          )}

          {/* Quick Demo Banner */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#16a34a" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d' }}>
                  Demo Mode
                </div>
                <div style={{ fontSize: '11px', color: '#166534' }}>
                  Code: <code style={{ fontWeight: '700' }}>GH-OCT-2026</code>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAutoFillAndSubmit('GH-OCT-2026')}
              disabled={loading}
              className="btn btn-sm"
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ⚡ Try Demo
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleCodeSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label htmlFor="accessCodeInput" className="form-label" style={{ margin: 0 }}>
                  Access Code
                </label>
                <button
                  type="button"
                  onClick={() => setAccessCode('GH-OCT-2026')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0969da',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Sparkles size={13} />
                  Auto-fill Demo Code
                </button>
              </div>
              <input
                id="accessCodeInput"
                type="text"
                className="input-text input-code"
                placeholder="e.g. GH-OCT-2026"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                autoFocus
                disabled={loading}
                style={{
                  fontSize: '18px',
                  textAlign: 'center',
                  padding: '12px',
                  letterSpacing: '2px'
                }}
              />
              <span className="form-hint" style={{ textAlign: 'center', marginTop: '6px' }}>
                Demo code: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', color: '#0969da' }}>GH-OCT-2026</code>
              </span>
            </div>

            <button
              id="enterPortalButton"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying Session...
                </>
              ) : (
                <>
                  Enter Portal
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Need help? Ask your session mentor or check your workshop registration email for your unique code.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
