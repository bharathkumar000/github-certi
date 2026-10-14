'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import {
  Calendar,
  KeyRound,
  Upload,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

export default function EditSessionPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [sessionName, setSessionName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [dateMode, setDateMode] = useState('auto_current');
  const [customDateText, setCustomDateText] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/sessions/${sessionId}`);
        if (!res.ok) {
          router.replace('/admin/dashboard');
          return;
        }
        const data = await res.json();
        const s = data.session;
        setSession(s);
        setSessionName(s.session_name);
        setSessionDate(s.session_date);
        setIsActive(s.is_active);
        setDateMode(s.date_mode || 'auto_current');
        setCustomDateText(s.custom_date_text || '');
        setTimezone(s.timezone || 'Asia/Kolkata');
      } catch (err) {
        setError('Failed to load session details.');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_name: sessionName,
          session_date: sessionDate,
          is_active: isActive,
          date_mode: dateMode,
          custom_date_text: customDateText,
          timezone
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update session');
      }

      setSuccess('Session details updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTemplate(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/admin/sessions/${sessionId}/template`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload template');

      setSuccess('Certificate template uploaded and updated successfully!');
      setSession(prev => ({ ...prev, certificate_template_path: data.template_path }));
    } catch (err) {
      setError(err.message || 'Upload error');
    } finally {
      setUploadingTemplate(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!confirm(`Are you sure you want to permanently delete session "${sessionName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        alert('Failed to delete session');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ background: '#080b11', minHeight: '100vh', color: '#f1f5f9' }}>
        <AdminNav />
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <span className="spinner" style={{ borderColor: '#00ff66', borderTopColor: 'transparent' }}></span>
          <p style={{ marginTop: '12px', color: '#8b9cb3' }}>Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: '#080b11', minHeight: '100vh', color: '#f1f5f9' }}>
      <AdminNav />

      <main className="main-content" style={{ padding: '32px 0 60px' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Link
              href="/admin/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#8b9cb3',
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <Link
              href={`/admin/sessions/${sessionId}/editor`}
              className="btn btn-secondary btn-sm"
              style={{ color: '#38bdf8' }}
            >
              <Sliders size={14} />
              Open Visual Layout Editor
            </Link>
          </div>

          <div className="card" style={{ padding: '32px', background: '#0d1520', border: '1px solid #1e314b', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #162334' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>
                  Edit Workshop Session
                </h1>
                <p style={{ fontSize: '13px', color: '#8b9cb3', marginTop: '4px' }}>
                  Session ID: <code style={{ fontSize: '12px', color: '#00ff66' }}>{sessionId}</code>
                </p>
              </div>

              <button
                type="button"
                onClick={handleDeleteSession}
                className="btn btn-danger btn-sm"
                title="Delete Session"
              >
                <Trash2 size={14} />
                Delete Session
              </button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <div>{success}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Workshop Session Name *</label>
                <input
                  type="text"
                  required
                  className="input-text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Session Date</label>
                  <input
                    type="date"
                    required
                    className="input-text"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Session Status</label>
                  <select
                    className="select-input"
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                  >
                    <option value="true">Active (Participants Can Access)</option>
                    <option value="false">Inactive (Access Rejected)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '16px 0' }}>
                <div className="form-group">
                  <label className="form-label">Date Mode</label>
                  <select
                    className="select-input"
                    value={dateMode}
                    onChange={(e) => setDateMode(e.target.value)}
                  >
                    <option value="auto_current">Auto Today's Date</option>
                    <option value="custom">Fixed Workshop Date</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select
                    className="select-input"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (Default)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>

              {dateMode === 'custom' && (
                <div className="form-group">
                  <label className="form-label">Custom Date Text</label>
                  <input
                    type="text"
                    className="input-text"
                    value={customDateText}
                    onChange={(e) => setCustomDateText(e.target.value)}
                  />
                </div>
              )}

              {/* Template Section */}
              <div style={{
                background: '#070c14',
                border: '1px solid #1e314b',
                borderRadius: '8px',
                padding: '20px',
                margin: '24px 0'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>
                  Certificate Template Background
                </h3>
                <p style={{ fontSize: '13px', color: '#8b9cb3', marginBottom: '14px' }}>
                  Current template: <code style={{ color: '#38bdf8' }}>{session?.certificate_template_path}</code>
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <img
                    src={session?.certificate_template_path || '/templates/default-certificate.png'}
                    alt="Current Template"
                    style={{
                      height: '90px',
                      borderRadius: '6px',
                      border: '1px solid #1e314b',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}
                  />

                  <div>
                    <input
                      type="file"
                      id="replaceTemplateInput"
                      accept="image/png,image/jpeg,application/pdf"
                      onChange={handleTemplateUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingTemplate}
                    />
                    <label htmlFor="replaceTemplateInput" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      <Upload size={14} />
                      {uploadingTemplate ? 'Uploading...' : 'Upload & Replace Template'}
                    </label>
                    <p style={{ fontSize: '11px', color: '#57687d', marginTop: '6px' }}>
                      Supports PNG, JPG, or PDF (Max 15MB)
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Link href="/admin/dashboard" className="btn btn-secondary">
                  Cancel
                </Link>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
