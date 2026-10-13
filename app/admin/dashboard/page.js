'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import {
  KeyRound,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Power
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state to create a participant access code
  const [newCode, setNewCode] = useState('');
  const [sessionName, setSessionName] = useState('');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'GH-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sessions');

      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }

      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setErrorMessage('Failed to load access codes. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateCode = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMessage('');
    setActionMessage('');

    try {
      const codeToUse = (newCode && newCode.trim())
        ? newCode.trim().toUpperCase()
        : undefined;

      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: codeToUse,
          session_name: sessionName.trim() || undefined,
          session_date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create access code.');
        setCreating(false);
        return;
      }

      const createdCode = data.session?.raw_code_for_admin || codeToUse;
      setActionMessage(`🎉 Access code created successfully: ${createdCode}`);
      setNewCode('');
      setSessionName('');
      fetchSessions();

      // Automatically copy to clipboard for convenience
      if (createdCode && navigator.clipboard) {
        navigator.clipboard.writeText(createdCode).catch(() => {});
      }
    } catch (err) {
      console.error('Error creating code:', err);
      setErrorMessage('An unexpected error occurred while creating code.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleToggleActive = async (session) => {
    try {
      const newStatus = !session.is_active;
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (res.ok) {
        setActionMessage(`Code ${session.raw_code_for_admin || ''} is now ${newStatus ? 'Active' : 'Disabled'}.`);
        fetchSessions();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteSession = async (session) => {
    const code = session.raw_code_for_admin || 'this';
    if (!confirm(`Are you sure you want to delete access code "${code}"? Participants will no longer be able to use it.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setActionMessage(`Access code "${code}" deleted.`);
        fetchSessions();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to delete code:', err);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AdminNav />

      <main className="main-content" style={{ padding: '36px 0 60px' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          
          {/* Page Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              Participant Access Codes
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Create and share access codes for workshop participants to generate and download their certificates.
            </p>
          </div>

          {/* Alert Messages */}
          {actionMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#15803d',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{actionMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* CARD 1: Create New Access Code */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            padding: '24px 28px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <KeyRound size={20} color="#16a34a" />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Create New Access Code
              </h2>
            </div>

            <form onSubmit={handleCreateCode}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Access Code Input */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                      Access Code *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: 0
                      }}
                    >
                      <Sparkles size={12} />
                      Generate Random
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GH-NOV-2026"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      fontWeight: '600',
                      letterSpacing: '1px'
                    }}
                  />
                </div>

                {/* Session Label Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Workshop / Batch Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Workshop – Batch 1"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 22px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {creating ? (
                    'Creating...'
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Create Participant Access Code
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* CARD 2: Access Codes List */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Participant Access Codes ({sessions.length})
                </h3>
              </div>
              <button
                onClick={fetchSessions}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '13px'
                }}
              >
                <RefreshCw size={13} className={loading ? 'spinner' : ''} />
                Refresh
              </button>
            </div>

            {loading && sessions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Loading access codes...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
                <KeyRound size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: '0 0 12px', fontWeight: '500' }}>No access codes created yet.</p>
                <button
                  onClick={generateRandomCode}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '6px' }}
                >
                  Generate First Code
                </button>
              </div>
            ) : (
              <div style={{ divideY: '1px solid #f1f5f9' }}>
                {sessions.map((session) => {
                  const code = session.raw_code_for_admin || 'GH-OCT-2026';
                  const isCopied = copiedCodeId === session.id;

                  return (
                    <div
                      key={session.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      {/* Left: Code badge and session label */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '6px 14px',
                          borderRadius: '8px'
                        }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#0f172a',
                            letterSpacing: '0.8px'
                          }}>
                            {code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(code, session.id)}
                            style={{
                              background: isCopied ? '#dcfce7' : '#ffffff',
                              border: isCopied ? '1px solid #86efac' : '1px solid #cbd5e1',
                              color: isCopied ? '#15803d' : '#475569',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              transition: 'all 0.15s ease'
                            }}
                            title="Copy access code"
                          >
                            {isCopied ? (
                              <>
                                <Check size={13} color="#15803d" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                Copy
                              </>
                            )}
                          </button>
                        </div>

                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                            {session.session_name || 'Workshop Session'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            Created: {session.session_date || 'Active'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Active/Inactive badge & delete action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(session)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            border: session.is_active ? '1px solid #86efac' : '1px solid #cbd5e1',
                            background: session.is_active ? '#f0fdf4' : '#f1f5f9',
                            color: session.is_active ? '#15803d' : '#64748b'
                          }}
                          title="Click to toggle active status"
                        >
                          <Power size={11} />
                          {session.is_active ? 'Active' : 'Disabled'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete access code"
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
