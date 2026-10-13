'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  RotateCcw,
  Sparkles,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { renderPdfToCanvas } from '@/lib/pdfjs-loader';

export default function CertificateWorkspacePage() {
  const router = useRouter();

  const [sessionData, setSessionData] = useState(null);
  const [layout, setLayout] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const [pdfRendering, setPdfRendering] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1086 / 814.5');

  // Fetch session and layout info on load
  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const res = await fetch('/api/portal/session-info');
        if (!res.ok) {
          // If unauthorized or expired, redirect to access code page
          router.replace('/portal');
          return;
        }

        const data = await res.json();
        setSessionData(data.session);
        setLayout(data.layout);
      } catch (err) {
        console.error('Error fetching session info:', err);
        setError('Failed to load session details. Please try re-entering your access code.');
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [router]);

  // Render PDF template onto canvas whenever template path is available
  useEffect(() => {
    if (!sessionData?.certificate_template_path) return;
    const tPath = sessionData.certificate_template_path;
    if (tPath.toLowerCase().endsWith('.pdf')) {
      let isSubscribed = true;
      setPdfRendering(true);

      renderPdfToCanvas(tPath, pdfCanvasRef.current)
        .then((res) => {
          if (isSubscribed && res?.aspectRatio) {
            setAspectRatio(res.aspectRatio);
          }
        })
        .catch((err) => console.error('PDF render error:', err))
        .finally(() => {
          if (isSubscribed) setPdfRendering(false);
        });

      return () => {
        isSubscribed = false;
      };
    }
  }, [sessionData?.certificate_template_path]);

  // Handle PDF Download
  const handleDownload = async () => {
    if (!participantName.trim()) {
      setError('Please type your name before downloading the certificate.');
      return;
    }

    setError('');
    setDownloadSuccessMessage('');
    setDownloading(true);

    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: participantName.trim(),
          sessionId: sessionData?.id
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate certificate.');
      }

      // Read PDF blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Create download anchor and trigger download
      const cleanName = participantName.trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
      const filename = `GitHub_Workshop_${cleanName}.pdf`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Download completed -> finalize session and redirect back to access portal
      setDownloadSuccessMessage(`Certificate for "${participantName.trim()}" downloaded successfully! Returning to access portal...`);

      setTimeout(() => {
        router.replace('/portal?downloaded=true');
      }, 1500);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Error creating PDF certificate.');
      setDownloading(false);
    }
  };

  // Dynamic font size scaling calculation for long names
  const calculateDynamicFontSize = () => {
    const baseSize = layout?.name_font_size || 40;
    const nameLen = participantName.length;

    // Normal names (up to 20 chars) use full size
    if (nameLen <= 22) return baseSize;

    // Scale down smoothly for longer names down to a minimum of 20
    const scale = Math.max(0.5, 22 / nameLen);
    return Math.round(baseSize * scale);
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner" style={{ width: '36px', height: '36px', borderColor: '#238636', borderTopColor: 'transparent' }}></span>
          <p style={{ marginTop: '16px', fontSize: '15px', color: '#475569', fontWeight: '500' }}>
            Preparing your certificate workspace...
          </p>
        </div>
      </div>
    );
  }

  const dynamicFontSize = calculateDynamicFontSize();
  const templatePath = sessionData?.certificate_template_path || '/templates/default-certificate.png';
  const displayDate = sessionData?.display_date || '';

  return (
    <div className="page-wrapper" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: '#0d1117',
        borderBottom: '1px solid #30363d',
        padding: '14px 0',
        color: '#ffffff'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', textDecoration: 'none' }}>
              <svg height="28" viewBox="0 0 16 16" version="1.1" width="28" fill="#ffffff" aria-hidden="true">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              <span style={{ fontWeight: '600', fontSize: '16px' }}>GitHub Workshop</span>
            </Link>
            <span style={{ color: '#8b949e' }}>/</span>
            <span style={{ fontSize: '14px', color: '#58a6ff', fontWeight: '500' }}>
              {sessionData?.session_name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/portal"
              style={{
                color: '#8b949e',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              <RotateCcw size={14} /> Switch Session Code
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="main-content" style={{ padding: '32px 0 60px' }}>
        <div className="container" style={{ maxWidth: '1160px' }}>
          
          {/* Status feedback alerts */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {downloadSuccessMessage && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>{downloadSuccessMessage}</div>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 380px) 1fr',
            gap: '28px',
            alignItems: 'start'
          }}>
            {/* Left Controls Card */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={20} color="#238636" />
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                  Certificate Details
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Enter your name below. The live preview on the right will update in real time.
              </p>

              {/* Participant Name Input */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="participantNameInput" className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Your Full Name *</span>
                  {participantName && (
                    <button
                      type="button"
                      onClick={() => setParticipantName('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#cf222e',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Clear Name
                    </button>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="participantNameInput"
                    type="text"
                    className="input-text"
                    placeholder="e.g. Anu Reddy"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    autoFocus
                    maxLength={90}
                    style={{
                      fontSize: '16px',
                      padding: '11px 14px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <span className="form-hint" style={{ marginTop: '6px' }}>
                  Preserves your exact casing, spacing, and special characters.
                </span>
              </div>

              {/* Automatic Date Field */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#0969da" />
                  <span>Workshop Certificate Date</span>
                </label>
                <div style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{displayDate || '13 October 2026'}</span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                    {sessionData?.timezone || 'Asia/Kolkata'}
                  </span>
                </div>
                <span className="form-hint" style={{ marginTop: '4px' }}>
                  Auto-populated accurately for the workshop date.
                </span>
              </div>

              {/* Download Certificate Button */}
              <button
                id="downloadCertificateButton"
                type="button"
                onClick={handleDownload}
                disabled={downloading || Boolean(downloadSuccessMessage) || !participantName.trim()}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(35, 134, 54, 0.25)'
                }}
              >
                {downloading ? (
                  <>
                    <span className="spinner"></span>
                    Generating High-Res PDF...
                  </>
                ) : downloadSuccessMessage ? (
                  <>
                    <CheckCircle2 size={18} />
                    Downloaded! Redirecting...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download Certificate (PDF)
                  </>
                )}
              </button>
            </div>

            {/* Right Live Preview Area */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>
                    Live Certificate Preview
                  </span>
                  <span className="badge badge-blue">
                    Real-Time 1:1 Rendering
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  PDF matches this view exactly
                </span>
              </div>

              {/* Preview Canvas Container */}
              <div
                ref={containerRef}
                id="certificatePreviewContainer"
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: aspectRatio,
                  background: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #cbd5e1',
                  userSelect: 'none',
                  containerType: 'inline-size'
                }}
              >
                {/* Background PDF Canvas */}
                <canvas
                  ref={pdfCanvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    display: templatePath?.toLowerCase().endsWith('.pdf') ? 'block' : 'none'
                  }}
                />

                {/* Fallback Image for non-PDF templates */}
                {!templatePath?.toLowerCase().endsWith('.pdf') && (
                  <img
                    src={templatePath}
                    alt="Certificate Template"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                {pdfRendering && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.85)',
                    zIndex: 10
                  }}>
                    <span className="spinner" style={{ borderColor: '#0969da', borderTopColor: 'transparent', width: '28px', height: '28px' }}></span>
                  </div>
                )}

                {/* Live Name Overlay */}
                <div
                  id="previewNameOverlay"
                  style={{
                    position: 'absolute',
                    left: `${layout?.name_x ?? 7.25}%`,
                    top: `${layout?.name_y ?? 51.8}%`,
                    transform: layout?.name_alignment === 'left'
                      ? 'translate(0%, -50%)'
                      : layout?.name_alignment === 'right'
                        ? 'translate(-100%, -50%)'
                        : 'translate(-50%, -50%)',
                    textAlign: layout?.name_alignment || 'left',
                    maxWidth: `${layout?.name_max_width ?? 60}%`,
                    width: 'auto',
                    whiteSpace: 'nowrap',
                    color: layout?.name_color || '#111827',
                    fontFamily: layout?.name_font_family?.includes('Times')
                      ? '"Times New Roman", Times, serif'
                      : layout?.name_font_family?.includes('Courier')
                        ? '"Courier New", Courier, monospace'
                        : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: layout?.name_font_family?.includes('Bold') ? '700' : '600',
                    fontSize: `clamp(14px, ${(dynamicFontSize / 1086) * 100}cqw, ${dynamicFontSize * 1.1}px)`,
                    letterSpacing: '-0.3px',
                    pointerEvents: 'none',
                    transition: 'font-size 0.1s ease',
                    textShadow: '0 1px 2px rgba(255,255,255,0.7)'
                  }}
                >
                  {participantName || (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal', opacity: 0.7 }}>
                      [Your Name Appears Here]
                    </span>
                  )}
                </div>

                {/* Live Date Overlay */}
                {displayDate && (
                  <div
                    id="previewDateOverlay"
                    style={{
                      position: 'absolute',
                      left: `${layout?.date_x ?? 74.2}%`,
                      top: `${layout?.date_y ?? 82.5}%`,
                      transform: layout?.date_alignment === 'left'
                        ? 'translate(0%, -50%)'
                        : layout?.date_alignment === 'right'
                          ? 'translate(-100%, -50%)'
                          : 'translate(-50%, -50%)',
                      textAlign: layout?.date_alignment || 'left',
                      color: layout?.date_color || '#334155',
                      fontFamily: layout?.date_font_family?.includes('Times')
                        ? '"Times New Roman", Times, serif'
                        : layout?.date_font_family?.includes('Courier')
                          ? '"Courier New", Courier, monospace'
                          : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontWeight: layout?.date_font_family?.includes('Bold') ? '700' : '500',
                      fontSize: `clamp(9px, ${((layout?.date_font_size || 13) / 1086) * 100}cqw, ${(layout?.date_font_size || 13) * 1.05}px)`,
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {displayDate}
                  </div>
                )}
              </div>

              {/* Preview Instruction Note */}
              <div style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#64748b'
              }}>
                <span>Session: {sessionData?.session_name}</span>
                <span>Timezone: {sessionData?.timezone || 'Asia/Kolkata'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
