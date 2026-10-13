'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import {
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  DownloadCloud,
  PlusCircle,
  Copy,
  Check,
  Edit,
  Sliders,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    inactiveSessions: 0,
    totalDownloads: 0
  });
  const [sessions, setSessions] = useState([]);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Modal state for code regeneration confirmation
  const [regenModalSession, setRegenModalSession] = useState(null);
  const [regenCustomCode, setRegenCustomCode] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Check auth and fetch sessions
      const [sessionsRes, statsRes] = await Promise.all([
        fetch('/api/admin/sessions'),
        fetch('/api/admin/logs')
      ]);

      if (sessionsRes.status === 401) {
        router.replace('/admin/login');
        return;
      }

      const sessionsData = await sessionsRes.json();
      const logsData = await statsRes.json();

      setSessions(sessionsData.sessions || []);
      setStats(logsData.stats || {
        totalSessions: (sessionsData.sessions || []).length,
        activeSessions: (sessionsData.sessions || []).filter(s => s.is_active).length,
        inactiveSessions: (sessionsData.sessions || []).filter(s => !s.is_active).length,
        totalDownloads: 0
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCopyCode = (code, sessionId) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeId(sessionId);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleToggleStatus = async (session) => {
    try {
      const newStatus = !session.is_active;
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (res.ok) {
        setActionMessage(`Session "${session.session_name}" ${newStatus ? 'activated' : 'deactivated'}.`);
        fetchDashboardData();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to toggle session status:', err);
    }
  };

  const handleConfirmRegenerateCode = async () => {
    if (!regenModalSession) return;
    setRegenerating(true);

    try {
      const res = await fetch(`/api/admin/sessions/${regenModalSession.id}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_code: regenCustomCode ? regenCustomCode.trim() : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Access code for "${regenModalSession.session_name}" updated to: ${data.new_code}. Previous code has been invalidated immediately.`);
        setRegenModalSession(null);
        setRegenCustomCode('');
        fetchDashboardData();
        setTimeout(() => setActionMessage(''), 6000);
      } else {
        alert(data.error || 'Failed to update access code');
      }
    } catch (err) {
      console.error('Error updating code:', err);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: '#f6f8fa' }}>
      <AdminNav />

      <main className="main-content" style={{ padding: '32px 0 60px' }}>
        <div className="container">
          
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2328' }}>
                Workshop Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: '#656d76', marginTop: '4px' }}>
                Manage workshop sessions, access codes, certificate templates, and monitor downloads.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={fetchDashboardData}
                className="btn btn-secondary btn-sm"
                title="Refresh Data"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <Link href="/admin/sessions/new" className="btn btn-primary">
                <PlusCircle size={16} />
                Create New Session
              </Link>
            </div>
          </div>

          {actionMessage && (
            <div className="alert alert-success" style={{ marginBottom: '24px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{actionMessage}</div>
            </div>
          )}

          {/* Stats Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#656d76' }}>TOTAL SESSIONS</span>
                <Layers size={18} color="#0969da" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2328', marginTop: '8px' }}>
                {stats.totalSessions}
              </div>
              <div style={{ fontSize: '12px', color: '#8c959f', marginTop: '4px' }}>
                Configured workshops
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#656d76' }}>ACTIVE SESSIONS</span>
                <CheckCircle2 size={18} color="#238636" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#238636', marginTop: '8px' }}>
                {stats.activeSessions}
              </div>
              <div style={{ fontSize: '12px', color: '#8c959f', marginTop: '4px' }}>
                Accepting participant entries
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#656d76' }}>INACTIVE SESSIONS</span>
                <XCircle size={18} color="#cf222e" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#656d76', marginTop: '8px' }}>
                {stats.inactiveSessions}
              </div>
              <div style={{ fontSize: '12px', color: '#8c959f', marginTop: '4px' }}>
                Closed / Access blocked
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#656d76' }}>TOTAL GENERATED</span>
                <DownloadCloud size={18} color="#8250df" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#8250df', marginTop: '8px' }}>
                {stats.totalDownloads}
              </div>
              <div style={{ fontSize: '12px', color: '#8c959f', marginTop: '4px' }}>
                Certificates generated
              </div>
            </div>
          </div>

          {/* Sessions List Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #d0d7de',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f6f8fa'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2328' }}>
                Workshop Sessions ({sessions.length})
              </h2>
              <span style={{ fontSize: '12px', color: '#656d76' }}>
                Independent access codes &amp; custom templates
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#656d76' }}>
                <span className="spinner" style={{ borderColor: '#238636', borderTopColor: 'transparent' }}></span>
                <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading workshop sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '15px', color: '#656d76', marginBottom: '16px' }}>
                  No workshop sessions created yet.
                </p>
                <Link href="/admin/sessions/new" className="btn btn-primary">
                  <PlusCircle size={16} />
                  Create Your First Session
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #d0d7de', background: '#f6f8fa', color: '#656d76' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Session Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Access Code</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Template</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #e1e4e8', transition: 'background 0.15s' }}>
                        {/* Name */}
                        <td style={{ padding: '16px', fontWeight: '600', color: '#1f2328' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{s.session_name}</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#8c959f', fontWeight: 'normal' }}>
                            Created: {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '16px', color: '#656d76' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#656d76" />
                            <span>{s.session_date}</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#8c959f' }}>
                            {s.date_mode === 'custom' ? 'Fixed Date' : 'Auto Today'}
                          </span>
                        </td>

                        {/* Access Code */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <code style={{
                              background: '#f3f4f6',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: '700',
                              color: '#0969da',
                              fontFamily: 'monospace'
                            }}>
                              {s.raw_code_for_admin || 'PROTECTED'}
                            </code>
                            {s.raw_code_for_admin && (
                              <button
                                onClick={() => handleCopyCode(s.raw_code_for_admin, s.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '11px' }}
                                title="Copy Access Code"
                              >
                                {copiedCodeId === s.id ? (
                                  <>
                                    <Check size={12} color="#238636" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    Copy
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            <button
                              onClick={() => {
                                setRegenModalSession(s);
                                setRegenCustomCode('');
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#0969da',
                                fontSize: '11px',
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: 'underline'
                              }}
                            >
                              Regenerate / Change Code
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => handleToggleStatus(s)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title={`Click to ${s.is_active ? 'deactivate' : 'activate'}`}
                          >
                            {s.is_active ? (
                              <span className="badge badge-active">
                                <CheckCircle2 size={12} /> Active
                              </span>
                            ) : (
                              <span className="badge badge-inactive">
                                <XCircle size={12} /> Inactive
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Template Status */}
                        <td style={{ padding: '16px' }}>
                          <span className="badge badge-purple" style={{ fontSize: '11px' }}>
                            <FileCheck size={12} />
                            {s.certificate_template_path?.includes('/uploads/') ? 'Custom Upload' : 'Default Official'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <Link
                              href={`/admin/sessions/${s.id}/editor`}
                              className="btn btn-secondary btn-sm"
                              title="Visual Certificate Template & Layout Editor"
                            >
                              <Sliders size={13} />
                              Layout Editor
                            </Link>

                            <Link
                              href={`/admin/sessions/${s.id}/edit`}
                              className="btn btn-secondary btn-sm"
                              title="Edit Session Details"
                            >
                              <Edit size={13} />
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Dialog for Changing Access Code */}
      {regenModalSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cf222e', marginBottom: '16px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2328' }}>
                Change Session Access Code
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px', lineHeight: '1.5' }}>
              Are you sure you want to change the access code for <strong>{regenModalSession.session_name}</strong>?
            </p>

            <div style={{
              background: '#ffebe9',
              border: '1px solid rgba(207, 34, 46, 0.2)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13px',
              color: '#cf222e',
              marginBottom: '20px'
            }}>
              <strong>Immediate Invalidation:</strong> Once changed, the previous access code will stop working immediately for all new access attempts. Only participants with the new code will be able to enter this session.
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">
                Custom Code (Leave empty to auto-generate random code)
              </label>
              <input
                type="text"
                className="input-text input-code"
                placeholder="e.g. GH-OCT-NEW"
                value={regenCustomCode}
                onChange={(e) => setRegenCustomCode(e.target.value.toUpperCase())}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRegenModalSession(null)}
                className="btn btn-secondary"
                disabled={regenerating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRegenerateCode}
                className="btn btn-danger"
                disabled={regenerating}
              >
                {regenerating ? (
                  <>
                    <span className="spinner"></span>
                    Invalidating &amp; Updating...
                  </>
                ) : (
                  'Confirm & Invalidate Old Code'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
