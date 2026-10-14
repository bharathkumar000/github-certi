'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';

export default function AdminLoginForm() {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedKey = accessKey.trim();
    if (!trimmedKey) {
      setError('Please enter your admin access key.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey: trimmedKey, accessCode: trimmedKey })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid admin access key. Please check and try again.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An error occurred during authentication. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: '#080b11', color: '#f1f5f9', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ padding: '20px 0', borderBottom: '1px solid #162334', background: '#05080e' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff66', textDecoration: 'none' }}>
            <svg height="28" viewBox="0 0 16 16" version="1.1" width="28" fill="#00ff66" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span style={{ fontWeight: '700', fontSize: '16px' }}>Certify Admin Portal</span>
          </Link>
          <Link href="/" style={{ color: '#8b9cb3', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Access Key Card */}
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#070c14',
              border: '1px solid #1e314b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#00ff66',
              boxShadow: '0 0 15px rgba(0, 255, 102, 0.2)'
            }}>
              <Shield size={28} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
              Admin Portal Access
            </h1>
            <p style={{ fontSize: '14px', color: '#8b9cb3', lineHeight: '1.5' }}>
              Enter your administrator access key to access session management, templates, and certificate tools
            </p>
          </div>

          <div style={{
            background: '#0d1520',
            border: '1px solid #1e314b',
            borderRadius: '16px',
            padding: '32px 28px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
          }}>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="adminAccessKey" style={{ color: '#f1f5f9', marginBottom: '8px', display: 'block' }}>
                  Admin Access Key
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    id="adminAccessKey"
                    type={showKey ? 'text' : 'password'}
                    required
                    autoFocus
                    className="input-text"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="Enter admin access key"
                    style={{
                      background: '#070c14',
                      borderColor: '#1e314b',
                      color: '#ffffff',
                      paddingLeft: '38px',
                      paddingRight: '40px',
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      letterSpacing: '1px'
                    }}
                  />
                  <KeyRound size={16} color="#57687d" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#8b9cb3',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                    title={showKey ? 'Hide Access Key' : 'Show Access Key'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '8px', fontWeight: '700' }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying Access Key...
                  </>
                ) : (
                  <>
                    Access Admin Portal
                    <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#57687d' }}>
            Protected administrator access &bull; Certify Portal Administration
          </div>
        </div>
      </main>
    </div>
  );
}
