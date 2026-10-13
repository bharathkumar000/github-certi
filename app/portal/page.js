'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

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

    const trimmedCode = accessCode.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please paste or enter your workshop access code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/portal/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: trimmedCode })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed. Please check the access code.');
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

  return (
    <div className="page-wrapper" style={{ background: '#f8fafc', minHeight: '100vh' }}>
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
          <Link href="/" style={{ color: '#8b949e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
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
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
              Please enter the access code provided by your instructor or session coordinator to unlock your certificate.
            </p>
          </div>

          {downloadedNotice && (
            <div className="alert alert-success" style={{ marginBottom: '20px', fontSize: '13px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Certificate Downloaded!</strong> Your session has completed. To generate another certificate, please enter a valid access code below.
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleCodeSubmit}>
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label htmlFor="accessCodeInput" className="form-label" style={{ marginBottom: '8px', color: '#1e293b' }}>
                Access Code
              </label>
              <input
                id="accessCodeInput"
                type="text"
                className="input-text input-code"
                placeholder="Paste your access code here"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                autoFocus
                disabled={loading}
                style={{
                  fontSize: '18px',
                  textAlign: 'center',
                  padding: '14px',
                  letterSpacing: '1.5px',
                  fontFamily: 'monospace',
                  fontWeight: '700'
                }}
              />
              <span className="form-hint" style={{ textAlign: 'center', marginTop: '8px', display: 'block', color: '#64748b' }}>
                Paste the unique access code created by the admin for your session.
              </span>
            </div>

            <button
              id="enterPortalButton"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
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
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              Need help? Ask your session mentor or coordinator for your session access code.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
