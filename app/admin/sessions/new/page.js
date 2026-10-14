'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import {
  Calendar,
  KeyRound,
  Upload,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function CreateSessionPage() {
  const router = useRouter();

  const [sessionName, setSessionName] = useState('GitHub Workshop – Session 2');
  const [sessionDate, setSessionDate] = useState('2026-10-13');
  const [accessCode, setAccessCode] = useState('');
  const [chosenCode, setChosenCode] = useState('');
  const [timerDuration, setTimerDuration] = useState('none');
  const [isActive, setIsActive] = useState(false);
  const [activatedAt, setActivatedAt] = useState(null);
  const [savingActivate, setSavingActivate] = useState(false);
  const [dateMode, setDateMode] = useState('auto_current');
  const [customDateText, setCustomDateText] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreview, setTemplatePreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const generateRandomCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setAccessCode(code);
    setChosenCode(code);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB. Please upload a smaller image or PDF.');
        return;
      }
      setTemplateFile(file);
      if (file.type.startsWith('image/')) {
        setTemplatePreview(URL.createObjectURL(file));
      } else {
        setTemplatePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!sessionName.trim() || !sessionDate) {
      setError('Session name and date are required.');
      return;
    }

    setSaving(true);

    try {
      // 1. Create the session
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_name: sessionName.trim(),
          session_date: sessionDate,
          access_code: accessCode.trim().toUpperCase(),
          is_active: isActive,
          date_mode: dateMode,
          custom_date_text: customDateText.trim(),
          timezone: timezone || 'Asia/Kolkata'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      const newSessionId = data.session.id;

      // 2. If a custom template file was uploaded, upload it now
      if (templateFile) {
        const formData = new FormData();
        formData.append('file', templateFile);
        const uploadRes = await fetch(`/api/admin/sessions/${newSessionId}/template`, {
          method: 'POST',
          body: formData
        });
        if (!uploadRes.ok) {
          console.warn('Template upload warning: file upload returned error');
        }
      }

      // 3. Redirect to the visual layout editor
      router.push(`/admin/sessions/${newSessionId}/editor`);
    } catch (err) {
      console.error('Create session error:', err);
      setError(err.message || 'An error occurred while creating the session.');
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: '#080b11', minHeight: '100vh', color: '#f1f5f9' }}>
      <AdminNav />

      <main className="main-content" style={{ padding: '32px 0 60px' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          
          <div style={{ marginBottom: '20px' }}>
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
          </div>

          <div className="card" style={{ padding: '32px', background: '#0d1520', border: '1px solid #1e314b', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #162334' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>
                Create Workshop Session
              </h1>
              <p style={{ fontSize: '14px', color: '#8b9cb3', marginTop: '4px' }}>
                Set up a new workshop session with its independent participant access code and certificate template.
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Session Name */}
              <div className="form-group">
                <label className="form-label">
                  Workshop Session Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-text"
                  placeholder="e.g. GitHub Workshop – Session 1"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
                <span className="form-hint">Displayed on the participant certificate and workspace.</span>
              </div>

              {/* Session Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Official Session Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input-text"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                  />
                </div>

                {/* Session Status Toggle */}
                <div className="form-group">
                  <label className="form-label">
                    Session Status
                  </label>
                  <select
                    className="select-input"
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                  >
                    <option value="true">Active (Accepts Participant Entries)</option>
                    <option value="false">Inactive (Rejects New Access)</option>
                  </select>
                </div>
              </div>

              {/* Access Code Management */}
              <div style={{
                background: '#070c14',
                border: '1px solid #1e314b',
                borderRadius: '8px',
                padding: '20px',
                margin: '20px 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <KeyRound size={18} color="#00ff66" />
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>
                    Participant Access Code
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#8b9cb3', marginBottom: '16px' }}>
                  Each session requires an independent access code. Participants use this to unlock their certificate.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    required
                    className="input-text input-code"
                    placeholder="e.g. 583921 (6-digit number)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ flex: 1, fontSize: '18px', letterSpacing: '3px', fontWeight: '700', color: '#00ff66' }}
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="btn btn-secondary"
                  >
                    <Sparkles size={14} color="#38bdf8" />
                    Auto-Generate
                  </button>
                </div> {/* closes flex div for input */}

                {/* Auto-Deactivate Timer */}
                <div className="form-group" style={{ marginTop: '16px', marginBottom: '8px' }}>
                  <label className="form-label">
                    Auto-Deactivate Timer
                  </label>
                  <select
                    className="select-input"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(e.target.value)}
                  >
                    <option value="30">⏱️ 30 Seconds</option>
                    <option value="45">⏱️ 45 Seconds</option>
                    <option value="60">⏱️ 1 Minute</option>
                    <option value="120">⏱️ 2 Minutes</option>
                    <option value="none">♾️ No Timer (Never Expire)</option>
                  </select>
                  <span className="form-hint">
                    The access code will automatically expire and deactivate after this timer.
                  </span>
                </div>
              </div>

              {/* Date Insertion Mode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Certificate Date Insertion Mode
                  </label>
                  <select
                    className="select-input"
                    value={dateMode}
                    onChange={(e) => setDateMode(e.target.value)}
                  >
                    <option value="auto_current">Auto Today's Date (Default)</option>
                    <option value="custom">Fixed Workshop Date</option>
                  </select>
                  <span className="form-hint">
                    {dateMode === 'auto_current'
                      ? 'Automatically inserts current date (e.g. 13 October 2026) in configured timezone'
                      : 'Uses a fixed date string across all certificate generations'}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Timezone
                  </label>
                  <select
                    className="select-input"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (India Standard Time - Default)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              {dateMode === 'custom' && (
                <div className="form-group">
                  <label className="form-label">
                    Custom Date Text
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. 13 October 2026"
                    value={customDateText}
                    onChange={(e) => setCustomDateText(e.target.value)}
                  />
                </div>
              )}

              {/* Certificate Template Upload */}
              <div style={{
                border: '1px dashed #1e314b',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                margin: '24px 0',
                background: '#070c14'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#0d1520',
                  border: '1px solid #1e314b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: '#38bdf8'
                }}>
                  <Upload size={22} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>
                  Upload Custom Certificate Template (Optional)
                </h3>
                <p style={{ fontSize: '13px', color: '#8b9cb3', maxWidth: '500px', margin: '0 auto 16px' }}>
                  Upload your high-resolution PNG, JPEG, or PDF certificate design. If left empty, the official default GitHub Workshop certificate template is used automatically.
                </p>

                <input
                  type="file"
                  id="templateUploadInput"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <label htmlFor="templateUploadInput" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  {templateFile ? templateFile.name : 'Choose Template File (PNG / JPEG / PDF)'}
                </label>

                {templatePreview && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#00ff66', fontWeight: '500', marginBottom: '8px' }}>
                      Template Selected Preview:
                    </p>
                    <img
                      src={templatePreview}
                      alt="Template Preview"
                      style={{
                        maxHeight: '180px',
                        borderRadius: '6px',
                        border: '1px solid #1e314b',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid #162334'
              }}>
                <Link href="/admin/dashboard" className="btn btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {saving ? (
                    <>
                      <span className="spinner"></span>
                      Creating &amp; Opening Visual Editor...
                    </>
                  ) : (
                    'Create Session & Configure Layout'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
