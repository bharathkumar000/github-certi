'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  Power,
  Clock,
  Timer
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state to create a participant access code
  const [newCode, setNewCode] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [timerDuration, setTimerDuration] = useState('30'); // default 30 mins
  const [customMinutes, setCustomMinutes] = useState('45');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 1-second interval to update live countdown timers
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sessions');

      if (res.status === 401) {
        router.replace('/admin');
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

  // Check admin auth once on component mount, then load sessions
  useEffect(() => {
    let isMounted = true;
    const checkAuthAndLoad = async () => {
      try {
        const res = await fetch('/api/admin/auth-check');
        const data = await res.json().catch(() => ({}));
        if (!data.authenticated) {
          router.replace('/admin');
          return;
        }
        if (isMounted) {
          setAuthChecking(false);
          await fetchSessions();
        }
      } catch (err) {
        router.replace('/admin');
      }
    };
    checkAuthAndLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - currentTime;
    if (diff <= 0) return { expired: true, text: 'Expired' };

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let text = '';
    if (hours > 0) {
      text = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      text = `${minutes}m ${seconds}s`;
    } else {
      text = `${seconds}s`;
    }

    const isUrgent = diff < 5 * 60 * 1000;
    return { expired: false, text, isUrgent };
  };

  const handleExtendTimer = async (session, addMinutes) => {
    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add_minutes: addMinutes })
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(`⏱️ Added +${addMinutes}m to ${session.raw_code_for_admin || 'code'}`);
        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, expires_at: data.session.expires_at, is_active: true } : s));
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to extend timer:', err);
    }
  };

  const generateRandomCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setNewCode(code);
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMessage('');
    setActionMessage('');

    try {
      const codeToUse = (newCode && newCode.trim())
        ? newCode.replace(/\D/g, '')
        : Math.floor(100000 + Math.random() * 900000).toString();

      if (codeToUse.length !== 6) {
        setErrorMessage('Access code must be a 6-digit number.');
        setCreating(false);
        return;
      }

      let durationToSend = null;
      if (timerDuration === 'custom') {
        const cNum = Number(customMinutes);
        if (isNaN(cNum) || cNum <= 0) {
          setErrorMessage('Please enter a valid number of minutes for the custom timer.');
          setCreating(false);
          return;
        }
        durationToSend = cNum;
      } else if (timerDuration !== 'none') {
        durationToSend = Number(timerDuration);
      }

      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: codeToUse,
          session_name: sessionName.trim() || undefined,
          session_date: new Date().toISOString().split('T')[0],
          duration_minutes: durationToSend
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create access code.');
        setCreating(false);
        return;
      }

      const createdCode = data.session?.raw_code_for_admin || codeToUse;
      const expiryNotice = durationToSend ? ` (auto-deactivates in ${durationToSend}m)` : '';
      setActionMessage(`🎉 Access code created: ${createdCode}${expiryNotice}`);

      // Immediately add the new code to the table so the user sees it right away!
      if (data.session) {
        setSessions((prev) => [
          { ...data.session, raw_code_for_admin: createdCode },
          ...prev.filter((s) => s.id !== data.session.id)
        ]);
      }

      setNewCode('');
      setSessionName('');

      // Also trigger background fetch to ensure synchronization
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
    const newStatus = !session.is_active;
    // Optimistically update status in UI immediately
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, is_active: newStatus } : s));

    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (res.ok) {
        setActionMessage(`Code ${session.raw_code_for_admin || ''} is now ${newStatus ? 'Active' : 'Disabled'}.`);
        setTimeout(() => setActionMessage(''), 3000);
      } else {
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchSessions();
    }
  };

  const handleDeleteSession = async (session) => {
    const code = session.raw_code_for_admin || session.access_code || session.code || 'this code';
    if (!confirm(`Are you sure you want to delete access code "${code}"? Participants will no longer be able to use it.`)) {
      return;
    }

    // Immediately remove from UI list
    setSessions(prev => prev.filter(s => s.id !== session.id && (s.raw_code_for_admin || s.id) !== (session.raw_code_for_admin || session.id)));

    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setActionMessage(`Access code "${code}" deleted successfully.`);
        setTimeout(() => setActionMessage(''), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || 'Failed to delete access code.');
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to delete code:', err);
      fetchSessions();
    }
  };

  if (authChecking) {
    return (
      <div className="page-wrapper" style={{ background: '#080b11', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner" style={{ width: '36px', height: '36px', borderColor: '#00ff66', borderTopColor: 'transparent' }}></span>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#8b9cb3' }}>
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: '#080b11', minHeight: '100vh', color: '#f1f5f9' }}>
      <AdminNav />

      <main className="main-content" style={{ padding: '36px 0 60px' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          
          {/* Page Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9', marginBottom: '6px' }}>
              Participant Access Codes
            </h1>
            <p style={{ color: '#8b9cb3', fontSize: '14px', margin: 0 }}>
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
              background: 'rgba(0, 255, 102, 0.1)',
              border: '1px solid rgba(0, 255, 102, 0.3)',
              borderRadius: '8px',
              color: '#00ff66',
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
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* CARD 1: Create New Access Code */}
          <div style={{
            background: '#0d1520',
            border: '1px solid #1e314b',
            borderRadius: '12px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
            padding: '24px 28px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <KeyRound size={20} color="#00ff66" />
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                Create New Access Code
              </h2>
            </div>

            <form onSubmit={handleCreateCode}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {/* Access Code Input */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>
                      6-Digit Access Code *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="e.g. 583921"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #1e314b',
                      fontSize: '16px',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      letterSpacing: '2px',
                      background: '#070c14',
                      color: '#00ff66'
                    }}
                  />
                </div>

                {/* Session Label Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>
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
                      border: '1px solid #1e314b',
                      fontSize: '14px',
                      background: '#070c14',
                      color: '#f1f5f9'
                    }}
                  />
                </div>

                {/* Auto-Deactivate Timer Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>
                    Auto-Deactivate Timer
                  </label>
                  <select
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #1e314b',
                      fontSize: '14px',
                      background: '#070c14',
                      color: '#f1f5f9'
                    }}
                  >
                    <option value="15" style={{ background: '#0d1520', color: '#f1f5f9' }}>⏱️ 15 Minutes</option>
                    <option value="30" style={{ background: '#0d1520', color: '#f1f5f9' }}>⏱️ 30 Minutes (Default)</option>
                    <option value="60" style={{ background: '#0d1520', color: '#f1f5f9' }}>⏱️ 1 Hour</option>
                    <option value="120" style={{ background: '#0d1520', color: '#f1f5f9' }}>⏱️ 2 Hours</option>
                    <option value="360" style={{ background: '#0d1520', color: '#f1f5f9' }}>⏱️ 6 Hours</option>
                    <option value="1440" style={{ background: '#0d1520', color: '#f1f5f9' }}>⏱️ 24 Hours</option>
                    <option value="custom" style={{ background: '#0d1520', color: '#f1f5f9' }}>⏱️ Custom Duration...</option>
                    <option value="none" style={{ background: '#0d1520', color: '#f1f5f9' }}>♾️ No Timer (Never Expire)</option>
                  </select>
                </div>
              </div>

              {timerDuration === 'custom' && (
                <div style={{ marginBottom: '16px', maxWidth: '280px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#8b9cb3', marginBottom: '4px' }}>
                    Custom Duration (in minutes):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      max="10080"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      style={{
                        width: '120px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #1e314b',
                        fontSize: '14px',
                        background: '#070c14',
                        color: '#f1f5f9'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#8b9cb3' }}>minutes</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#8b9cb3' }}>
                  ⏱️ Code automatically expires and deactivates after the timer ends.
                </span>
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
                      Generate Timed Access Code
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* CARD 2: Access Codes List */}
          <div style={{
            background: '#0d1520',
            border: '1px solid #1e314b',
            borderRadius: '12px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid #162334',
              background: '#05080e'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                  Participant Access Codes ({sessions.length})
                </h3>
              </div>
              <button
                onClick={fetchSessions}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8b9cb3',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                <RefreshCw size={13} className={loading ? 'spinner' : ''} />
                Refresh
              </button>
            </div>

            {loading && sessions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#8b9cb3' }}>
                Loading access codes...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#8b9cb3' }}>
                <KeyRound size={32} color="#57687d" style={{ margin: '0 auto 12px' }} />
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
              <div>
                {sessions.map((session) => {
                  const code = session.raw_code_for_admin || session.access_code || session.code || 'ACCESS-CODE';
                  const isCopied = copiedCodeId === session.id;
                  const timerInfo = formatRemaining(session.expires_at);
                  const isEffectivelyActive = session.is_active && (!timerInfo || !timerInfo.expired);

                  return (
                    <div
                      key={session.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: '1px solid #162334',
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
                          background: '#070c14',
                          border: '1px solid #1e314b',
                          padding: '6px 14px',
                          borderRadius: '8px'
                        }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '17px',
                            fontWeight: '700',
                            color: '#00ff66',
                            letterSpacing: '1px'
                          }}>
                            {code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(code, session.id)}
                            style={{
                              background: isCopied ? 'rgba(0, 255, 102, 0.15)' : '#0d1520',
                              border: isCopied ? '1px solid rgba(0, 255, 102, 0.4)' : '1px solid #1e314b',
                              color: isCopied ? '#00ff66' : '#8b9cb3',
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
                                <Check size={13} color="#00ff66" />
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
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {session.session_name || 'Workshop Session'}

                            {/* Timer countdown badge */}
                            {timerInfo ? (
                              timerInfo.expired ? (
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#f87171',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Clock size={11} />
                                  Expired
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  background: timerInfo.isUrgent ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 255, 102, 0.12)',
                                  color: timerInfo.isUrgent ? '#fbbf24' : '#00ff66',
                                  border: timerInfo.isUrgent ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(0, 255, 102, 0.3)',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Timer size={11} />
                                  {timerInfo.text} remaining
                                </span>
                              )
                            ) : (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '500',
                                background: '#111b29',
                                color: '#8b9cb3',
                                border: '1px solid #162334',
                                padding: '2px 8px',
                                borderRadius: '12px'
                              }}>
                                No timer
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#57687d', marginTop: '2px' }}>
                            Created: {session.session_date || 'Active'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Extend Timer & Status & Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Quick extend buttons */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleExtendTimer(session, 15)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              borderRadius: '6px',
                              color: '#38bdf8',
                              borderColor: '#1e314b',
                              background: '#070c14',
                              cursor: 'pointer'
                            }}
                            title="Add 15 minutes to timer"
                          >
                            +15m
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExtendTimer(session, 60)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              borderRadius: '6px',
                              color: '#38bdf8',
                              borderColor: '#1e314b',
                              background: '#070c14',
                              cursor: 'pointer'
                            }}
                            title="Add 1 hour to timer"
                          >
                            +1h
                          </button>
                        </div>

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
                            border: isEffectivelyActive ? '1px solid rgba(0, 255, 102, 0.35)' : '1px solid #1e314b',
                            background: isEffectivelyActive ? 'rgba(0, 255, 102, 0.12)' : '#111b29',
                            color: isEffectivelyActive ? '#00ff66' : '#8b9cb3'
                          }}
                          title="Click to toggle active status"
                        >
                          <Power size={11} />
                          {isEffectivelyActive ? 'Active' : 'Disabled'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#57687d',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete access code"
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#57687d')}
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
