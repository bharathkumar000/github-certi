'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Layers,
  Info
} from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalDownloads: 0, totalSessions: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStats(data.stats || { totalDownloads: 0, totalSessions: 0 });
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="page-wrapper" style={{ background: '#f6f8fa' }}>
      <AdminNav />

      <main className="main-content" style={{ padding: '32px 0 60px' }}>
        <div className="container">
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
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
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2328' }}>
                Certificate Generation &amp; Download Activity
              </h1>
              <p style={{ fontSize: '14px', color: '#656d76', marginTop: '4px' }}>
                Informational log of certificate requests processed by the server.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchLogs}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw size={14} /> Refresh Logs
            </button>
          </div>

          {/* Clarification banner */}
          <div style={{
            padding: '14px 16px',
            background: '#ffffff',
            border: '1px solid #d0d7de',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#656d76',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Info size={18} color="#0969da" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Note on tracking accuracy:</strong> These records confirm that the server successfully compiled and streamed the certificate PDF response. As per web privacy standards, participants can download their certificates repeatedly without restriction, and repeat downloads are never blocked.
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #d0d7de',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f6f8fa'
            }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#1f2328' }}>
                Recent Certificate Requests ({logs.length})
              </span>
              <span className="badge badge-active">
                Total Successful Generations: {stats.totalDownloads}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#656d76' }}>
                <span className="spinner" style={{ borderColor: '#238636', borderTopColor: 'transparent' }}></span>
                <p style={{ marginTop: '12px' }}>Loading activity logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#656d76' }}>
                <p style={{ fontSize: '15px' }}>No certificate generation activity recorded yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #d0d7de', background: '#f6f8fa', color: '#656d76' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Timestamp</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Workshop Session</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Recipient (Masked)</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #e1e4e8' }}>
                        <td style={{ padding: '14px 16px', color: '#656d76' }}>
                          {new Date(log.created_at).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1f2328' }}>
                          {log.session_name || 'Workshop Session'}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#57606a' }}>
                          {log.participant_name_masked || 'Participant'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {log.status === 'success' ? (
                            <span className="badge badge-active">
                              <CheckCircle2 size={12} /> Generated Successfully
                            </span>
                          ) : (
                            <span className="badge badge-inactive">
                              <XCircle size={12} /> Failed
                            </span>
                          )}
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
    </div>
  );
}
