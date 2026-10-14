'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2, Lock, ShieldAlert, Sparkles, RotateCcw } from 'lucide-react';

export default function ParticipantAccessPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadedNotice, setDownloadedNotice] = useState(false);
  const [isDeviceLocked, setIsDeviceLocked] = useState(false);
  const [downloadRecord, setDownloadRecord] = useState(null);
  const [isAdminTester, setIsAdminTester] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('downloaded') === 'true') {
        setDownloadedNotice(true);
      }

      // Check if logged in as admin
      const hasAdminCookie = document.cookie.includes('gh_admin_token=');
      if (hasAdminCookie) {
        setIsAdminTester(true);
      }

      // Check browser storage and cookies for prior download on this mobile / computer
      const localFlag = localStorage.getItem('cert_downloaded') === 'true';
      const cookieFlag = document.cookie.includes('gh_cert_device_downloaded=true');

      if (localFlag || cookieFlag) {
        setIsDeviceLocked(true);
        setDownloadRecord({
          name: localStorage.getItem('cert_downloaded_name') || 'Participant',
          date: localStorage.getItem('cert_downloaded_at') || '',
          session: localStorage.getItem('cert_downloaded_session') || 'Workshop Session'
        });
      }
    }
  }, []);

  // Admin testing helper to reset device lock
  const handleAdminResetLock = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cert_downloaded');
      localStorage.removeItem('cert_downloaded_name');
      localStorage.removeItem('cert_downloaded_at');
      localStorage.removeItem('cert_downloaded_session');
      localStorage.removeItem('cert_download_record');
      sessionStorage.removeItem('cert_downloaded');
      document.cookie = 'gh_cert_device_downloaded=; path=/; max-age=0;';
      setIsDeviceLocked(false);
      setDownloadRecord(null);
      setDownloadedNotice(false);
      setError('');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-submission block if this device has already downloaded
    if (isDeviceLocked) {
      setError('Download limit reached: This device (mobile/computer) has already generated a certificate. Re-entry is restricted to 1 download per participant.');
      return;
    }

    const cleanedCode = accessCode.trim().replace(/\s+/g, '');

    if (!cleanedCode) {
      setError('Please enter your 6-digit workshop access code.');
      return;
    }

    if (!/^\d{6}$/.test(cleanedCode) && cleanedCode !== 'GH-OCT-2026') {
      setError('Access code must be a 6-digit number (e.g. 849201).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/portal/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode: cleanedCode,
          clientDeviceDownloaded: isDeviceLocked
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isDeviceBlocked) {
          setIsDeviceLocked(true);
        }
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
    <div className="page-wrapper" style={{ background: '#080b11', minHeight: '100vh', color: '#f1f5f9' }}>
      {/* Top Header */}
      <header style={{
        background: '#05080e',
        borderBottom: '1px solid #162334',
        padding: '16px 0',
        color: '#ffffff'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#00ff66',
            textDecoration: 'none'
          }}>
            <svg height="28" viewBox="0 0 16 16" version="1.1" width="28" fill="#00ff66" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#00ff66' }}>Certify Portal</span>
          </Link>

          {/* Centered Middle Navbar Text */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '1px',
              color: '#f1f5f9',
              textTransform: 'uppercase'
            }}>
              INNOVATORS AND VISIONARIES CLUB
            </span>
          </div>

          <Link href="/" style={{ color: '#8b9cb3', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Access Code Card */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px 60px' }}>
        
        {/* Organization & Club Logos */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '24px',
              padding: '12px 30px',
              background: 'rgba(13, 21, 32, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid #1e314b',
              borderRadius: '60px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          >
            <img
              src="/logos/inunity-logo.png"
              alt="Inunity - Innovation for Community"
              style={{
                height: '42px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                mixBlendMode: 'screen'
              }}
            />
            <div style={{ width: '1.5px', height: '36px', background: '#1e314b' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/logos/ivc-logo.jpg"
                alt="Innovators & Visionaries Club (IVC)"
                style={{
                  height: '52px',
                  width: '52px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  display: 'block'
                }}
              />
              <span style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#f1f5f9',
                letterSpacing: '0.6px'
              }}>
                IVC
              </span>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: '#0d1520',
          borderRadius: '16px',
          border: '1px solid #1e314b',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          padding: '36px 32px'
        }}>
          {isDeviceLocked ? (
            /* Locked State: 1 Download Per Device Limit */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#ef4444',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)'
                }}>
                  <Lock size={28} />
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '20px',
                  color: '#f87171',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '12px'
                }}>
                  <ShieldAlert size={14} />
                  1 Download Per Device Limit
                </div>

                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px' }}>
                  Certificate Already Downloaded
                </h1>
                <p style={{ fontSize: '14px', color: '#8b9cb3', lineHeight: '1.5', margin: 0 }}>
                  This mobile device or computer has already generated and downloaded a workshop certificate.
                </p>
              </div>

              {downloadedNotice && (
                <div className="alert alert-success" style={{ marginBottom: '20px', fontSize: '13px' }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Certificate Download Complete!</strong> Your PDF has been saved. As per session rules, each participant is permitted to download only 1 certificate per device.
                  </div>
                </div>
              )}

              {/* Recorded Device Download Details Box */}
              <div style={{
                background: '#070c14',
                border: '1px solid #1e314b',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Device Download Record
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid rgba(239, 68, 68, 0.25)'
                  }}>
                    Limit Reached (1/1)
                  </span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#8b9cb3' }}>Issued To:</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#00ff66' }}>
                    {downloadRecord?.name || 'Participant'}
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#8b9cb3' }}>Workshop Session:</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>
                    {downloadRecord?.session || 'GitHub Workshop'}
                  </div>
                </div>

                {downloadRecord?.date && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#8b9cb3' }}>Downloaded On:</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(downloadRecord.date).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Locked Policy Notice */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#fca5a5',
                lineHeight: '1.5'
              }}>
                <strong>Access Restricted:</strong> Even if a valid access code is entered, re-entry into the certificate editing area is locked for this device to prevent duplicate downloads.
              </div>

              {/* Disabled Mock Input showing Lock */}
              <div className="form-group" style={{ marginBottom: '20px', opacity: 0.6 }}>
                <label className="form-label" style={{ marginBottom: '6px', color: '#8b9cb3', fontSize: '12px' }}>
                  Session Access Code
                </label>
                <div style={{
                  padding: '12px',
                  background: '#05080e',
                  border: '1px dashed #1e314b',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  LOCKED — 1 DOWNLOAD PER DEVICE
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                >
                  Return to Home
                </Link>

                {isAdminTester && (
                  <button
                    type="button"
                    onClick={handleAdminResetLock}
                    className="btn btn-outline"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '12px',
                      color: '#f59e0b',
                      borderColor: '#f59e0b',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <RotateCcw size={14} />
                    Admin Mode: Reset Device Lock (Testing)
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Normal Access Code Form */
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: '#070c14',
                  border: '1px solid #1e314b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#00ff66',
                  boxShadow: '0 0 15px rgba(0, 255, 102, 0.2)'
                }}>
                  <KeyRound size={26} />
                </div>

                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
                  Enter Session Access Code
                </h1>
                <p style={{ fontSize: '14px', color: '#8b9cb3', lineHeight: '1.5' }}>
                  Please enter the access code provided by your instructor or session coordinator to unlock your certificate.
                </p>
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleCodeSubmit}>
                <div className="form-group" style={{ marginBottom: '22px' }}>
                  <label htmlFor="accessCodeInput" className="form-label" style={{ marginBottom: '8px', color: '#f1f5f9' }}>
                    6-Digit Access Code
                  </label>
                  <input
                    id="accessCodeInput"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="input-text input-code"
                    placeholder="Enter 6-digit code (e.g. 849201)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                    disabled={loading}
                    style={{
                      fontSize: '22px',
                      textAlign: 'center',
                      padding: '14px',
                      letterSpacing: '6px',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      background: '#070c14',
                      borderColor: '#1e314b',
                      color: '#00ff66'
                    }}
                  />
                  <span className="form-hint" style={{ textAlign: 'center', marginTop: '8px', display: 'block', color: '#57687d' }}>
                    Enter the 6-digit session access code provided by your workshop mentor.
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
                    fontWeight: '700',
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
            </>
          )}

          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #162334',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#57687d', margin: 0 }}>
              Need help? Ask your session mentor or coordinator for your session access code.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
