'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import {
  Sliders,
  Save,
  RotateCcw,
  Eye,
  Type,
  Calendar,
  MousePointerClick,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Move
} from 'lucide-react';

export default function CertificateLayoutEditorPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Active target being positioned: 'name' or 'date'
  const [activeTarget, setActiveTarget] = useState('name');

  // Layout state
  const [layout, setLayout] = useState({
    name_x: 50,
    name_y: 49.5,
    name_font_family: 'Helvetica-Bold',
    name_font_size: 40,
    name_color: '#1a1f2c',
    name_alignment: 'center',
    name_max_width: 75,
    date_x: 27.5,
    date_y: 78.5,
    date_font_family: 'Helvetica',
    date_font_size: 15,
    date_color: '#475569',
    date_alignment: 'center'
  });

  const previewCanvasRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/sessions/${sessionId}/layout`);
        if (!res.ok) {
          router.replace('/admin/dashboard');
          return;
        }
        const data = await res.json();
        setSession(data.session);
        if (data.layout) {
          setLayout(prev => ({ ...prev, ...data.layout }));
        }
      } catch (err) {
        setErrorMessage('Failed to load certificate template and layout.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId, router]);

  // Click on canvas to instantly position the active element
  const handleCanvasClick = (e) => {
    if (!previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    const yPercent = Math.min(100, Math.max(0, (clickY / rect.height) * 100));

    // Round to 1 decimal place
    const roundedX = Math.round(xPercent * 10) / 10;
    const roundedY = Math.round(yPercent * 10) / 10;

    if (activeTarget === 'name') {
      setLayout(prev => ({ ...prev, name_x: roundedX, name_y: roundedY }));
    } else {
      setLayout(prev => ({ ...prev, date_x: roundedX, date_y: roundedY }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout)
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save layout configuration');
      }

      setSuccessMessage('Certificate layout saved successfully! All generated certificates for this session will use this configuration.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Error saving layout');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setLayout({
      name_x: 50,
      name_y: 49.5,
      name_font_family: 'Helvetica-Bold',
      name_font_size: 40,
      name_color: '#1a1f2c',
      name_alignment: 'center',
      name_max_width: 75,
      date_x: 27.5,
      date_y: 78.5,
      date_font_family: 'Helvetica',
      date_font_size: 15,
      date_color: '#475569',
      date_alignment: 'center'
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ background: '#f6f8fa' }}>
        <AdminNav />
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <span className="spinner" style={{ borderColor: '#238636', borderTopColor: 'transparent' }}></span>
          <p style={{ marginTop: '12px', color: '#656d76' }}>Loading visual template editor...</p>
        </div>
      </div>
    );
  }

  const templatePath = session?.certificate_template_path || '/templates/default-certificate.png';

  return (
    <div className="page-wrapper" style={{ background: '#f6f8fa' }}>
      <AdminNav />

      <main className="main-content" style={{ padding: '24px 0 60px' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Link
                  href="/admin/dashboard"
                  style={{ color: '#656d76', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', textDecoration: 'none' }}
                >
                  <ArrowLeft size={14} /> Dashboard
                </Link>
                <span style={{ color: '#d0d7de' }}>/</span>
                <span style={{ fontSize: '13px', color: '#0969da', fontWeight: '500' }}>{session?.session_name}</span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2328' }}>
                Visual Certificate Layout &amp; Positioning Editor
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={resetDefaults}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={14} />
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                <Save size={16} />
                {saving ? 'Saving Layout...' : 'Save Layout Configuration'}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Main 2-Column Workspace */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 400px) 1fr',
            gap: '24px',
            alignItems: 'start'
          }}>
            {/* Left Controls Panel */}
            <div className="card" style={{ padding: '24px' }}>
              
              {/* Target Selector Tabs (Name vs Date) */}
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '4px',
                marginBottom: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTarget('name')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: activeTarget === 'name' ? '#ffffff' : 'transparent',
                    color: activeTarget === 'name' ? '#1f2328' : '#656d76',
                    boxShadow: activeTarget === 'name' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Type size={15} color="#0969da" />
                  Participant Name
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTarget('date')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: activeTarget === 'date' ? '#ffffff' : 'transparent',
                    color: activeTarget === 'date' ? '#1f2328' : '#656d76',
                    boxShadow: activeTarget === 'date' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Calendar size={15} color="#238636" />
                  Certificate Date
                </button>
              </div>

              {/* Instructions banner */}
              <div style={{
                padding: '10px 12px',
                background: '#ddf4ff',
                border: '1px solid rgba(9, 105, 218, 0.2)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0969da',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MousePointerClick size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Tip:</strong> Click directly anywhere on the certificate canvas to place the selected <strong>{activeTarget === 'name' ? 'Name' : 'Date'}</strong> marker!
                </span>
              </div>

              {/* Controls for Active Target */}
              {activeTarget === 'name' ? (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1f2328', marginBottom: '14px' }}>
                    Participant Name Coordinates &amp; Style
                  </h3>

                  {/* Coordinates X & Y */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Horizontal X (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        className="input-text"
                        value={layout.name_x}
                        onChange={(e) => setLayout({ ...layout, name_x: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Vertical Y (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        className="input-text"
                        value={layout.name_y}
                        onChange={(e) => setLayout({ ...layout, name_y: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="form-group">
                    <label className="form-label">Font Family</label>
                    <select
                      className="select-input"
                      value={layout.name_font_family}
                      onChange={(e) => setLayout({ ...layout, name_font_family: e.target.value })}
                    >
                      <option value="Helvetica-Bold">Helvetica Bold (Modern Clean)</option>
                      <option value="Times-Bold">Times Roman Bold (Classic Formal)</option>
                      <option value="Courier-Bold">Courier Bold (Monospace Technical)</option>
                      <option value="Helvetica">Helvetica Regular</option>
                      <option value="Times">Times Roman Regular</option>
                    </select>
                  </div>

                  {/* Font Size & Color */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Font Size ({layout.name_font_size}pt)</label>
                      <input
                        type="range"
                        min="18"
                        max="64"
                        value={layout.name_font_size}
                        onChange={(e) => setLayout({ ...layout, name_font_size: Number(e.target.value) })}
                        style={{ width: '100%', marginTop: '6px' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Text Color</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={layout.name_color}
                          onChange={(e) => setLayout({ ...layout, name_color: e.target.value })}
                          style={{ width: '38px', height: '36px', border: '1px solid #d0d7de', borderRadius: '4px', padding: '1px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="input-text"
                          value={layout.name_color}
                          onChange={(e) => setLayout({ ...layout, name_color: e.target.value })}
                          style={{ flex: 1, fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alignment */}
                  <div className="form-group">
                    <label className="form-label">Text Alignment</label>
                    <select
                      className="select-input"
                      value={layout.name_alignment}
                      onChange={(e) => setLayout({ ...layout, name_alignment: e.target.value })}
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  {/* Maximum Width % */}
                  <div className="form-group">
                    <label className="form-label">
                      Max Name Width ({layout.name_max_width}% of certificate)
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="95"
                      value={layout.name_max_width}
                      onChange={(e) => setLayout({ ...layout, name_max_width: Number(e.target.value) })}
                      style={{ width: '100%', marginTop: '6px' }}
                    />
                    <span className="form-hint">
                      Auto-scales font down so long participant names never overflow.
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1f2328', marginBottom: '14px' }}>
                    Certificate Date Coordinates &amp; Style
                  </h3>

                  {/* Date Coordinates X & Y */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Date X (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        className="input-text"
                        value={layout.date_x}
                        onChange={(e) => setLayout({ ...layout, date_x: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Date Y (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        className="input-text"
                        value={layout.date_y}
                        onChange={(e) => setLayout({ ...layout, date_y: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="form-group">
                    <label className="form-label">Date Font Family</label>
                    <select
                      className="select-input"
                      value={layout.date_font_family}
                      onChange={(e) => setLayout({ ...layout, date_font_family: e.target.value })}
                    >
                      <option value="Helvetica">Helvetica Regular</option>
                      <option value="Helvetica-Bold">Helvetica Bold</option>
                      <option value="Times">Times Roman Regular</option>
                      <option value="Times-Bold">Times Roman Bold</option>
                      <option value="Courier">Courier</option>
                    </select>
                  </div>

                  {/* Font Size & Color */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Date Size ({layout.date_font_size}pt)</label>
                      <input
                        type="range"
                        min="10"
                        max="28"
                        value={layout.date_font_size}
                        onChange={(e) => setLayout({ ...layout, date_font_size: Number(e.target.value) })}
                        style={{ width: '100%', marginTop: '6px' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date Color</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={layout.date_color}
                          onChange={(e) => setLayout({ ...layout, date_color: e.target.value })}
                          style={{ width: '38px', height: '36px', border: '1px solid #d0d7de', borderRadius: '4px', padding: '1px', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          className="input-text"
                          value={layout.date_color}
                          onChange={(e) => setLayout({ ...layout, date_color: e.target.value })}
                          style={{ flex: 1, fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alignment */}
                  <div className="form-group">
                    <label className="form-label">Date Alignment</label>
                    <select
                      className="select-input"
                      value={layout.date_alignment}
                      onChange={(e) => setLayout({ ...layout, date_alignment: e.target.value })}
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Right Interactive Certificate Preview */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={18} color="#0969da" />
                  <span style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>
                    Interactive Template Canvas
                  </span>
                  <span className="badge badge-purple" style={{ fontSize: '11px' }}>
                    Click canvas to reposition {activeTarget === 'name' ? 'Name' : 'Date'}
                  </span>
                </div>
              </div>

              {/* The interactive template container */}
              <div
                ref={previewCanvasRef}
                onClick={handleCanvasClick}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #0969da',
                  cursor: 'crosshair',
                  userSelect: 'none'
                }}
              >
                {/* Background image */}
                <img
                  src={templatePath}
                  alt="Certificate Template Background"
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

                {/* Name Marker & Preview Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${layout.name_x}%`,
                    top: `${layout.name_y}%`,
                    transform: layout.name_alignment === 'left'
                      ? 'translate(0%, -50%)'
                      : layout.name_alignment === 'right'
                        ? 'translate(-100%, -50%)'
                        : 'translate(-50%, -50%)',
                    textAlign: layout.name_alignment,
                    maxWidth: `${layout.name_max_width}%`,
                    whiteSpace: 'nowrap',
                    color: layout.name_color,
                    fontFamily: layout.name_font_family?.includes('Times')
                      ? '"Times New Roman", Times, serif'
                      : layout.name_font_family?.includes('Courier')
                        ? '"Courier New", Courier, monospace'
                        : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: layout.name_font_family?.includes('Bold') ? '700' : '600',
                    fontSize: `clamp(14px, ${layout.name_font_size * 0.052}cqw, ${layout.name_font_size * 1.1}px)`,
                    padding: '2px 8px',
                    border: activeTarget === 'name' ? '2px dashed #0969da' : '1px dotted transparent',
                    background: activeTarget === 'name' ? 'rgba(9, 105, 218, 0.08)' : 'transparent',
                    borderRadius: '4px',
                    pointerEvents: 'none'
                  }}
                >
                  Jane Doe
                </div>

                {/* Date Marker & Preview Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${layout.date_x}%`,
                    top: `${layout.date_y}%`,
                    transform: layout.date_alignment === 'left'
                      ? 'translate(0%, -50%)'
                      : layout.date_alignment === 'right'
                        ? 'translate(-100%, -50%)'
                        : 'translate(-50%, -50%)',
                    textAlign: layout.date_alignment,
                    whiteSpace: 'nowrap',
                    color: layout.date_color,
                    fontFamily: layout.date_font_family?.includes('Times')
                      ? '"Times New Roman", Times, serif'
                      : layout.date_font_family?.includes('Courier')
                        ? '"Courier New", Courier, monospace'
                        : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: layout.date_font_family?.includes('Bold') ? '700' : '500',
                    fontSize: `clamp(9px, ${layout.date_font_size * 0.05}cqw, ${layout.date_font_size * 1.1}px)`,
                    padding: '2px 6px',
                    border: activeTarget === 'date' ? '2px dashed #238636' : '1px dotted transparent',
                    background: activeTarget === 'date' ? 'rgba(35, 134, 54, 0.08)' : 'transparent',
                    borderRadius: '4px',
                    pointerEvents: 'none'
                  }}
                >
                  13 October 2026
                </div>
              </div>

              {/* Coordinates Indicator */}
              <div style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#656d76',
                background: '#ffffff',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #d0d7de'
              }}>
                <div>
                  <span style={{ color: '#0969da', fontWeight: '600' }}>Name Position:</span> ({layout.name_x}%, {layout.name_y}%) &bull; Size: {layout.name_font_size}pt
                </div>
                <div>
                  <span style={{ color: '#238636', fontWeight: '600' }}>Date Position:</span> ({layout.date_x}%, {layout.date_y}%) &bull; Size: {layout.date_font_size}pt
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
