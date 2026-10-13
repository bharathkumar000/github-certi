import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { hashAccessCode, verifyAccessCodeHash } from './access-code.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if real Supabase credentials are configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

let supabase = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}

// Local File Store Fallback (stored in .data/store.json)
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULT_SEED_DATA = {
  sessions: [
    {
      id: 'ws-session-001',
      session_name: 'GitHub Workshop – Session 1 (Git & GitHub Fundamentals)',
      session_date: '2026-10-13',
      raw_code_for_admin: 'GH-OCT-2026', // Stored for admin display convenience in dev store
      access_code_hash: hashAccessCode('GH-OCT-2026'),
      is_active: true,
      certificate_template_path: '/templates/gitopia-certificate.pdf',
      date_mode: 'auto_current',
      custom_date_text: '',
      timezone: 'Asia/Kolkata',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  layouts: [
    {
      id: 'layout-001',
      session_id: 'ws-session-001',
      name_x: 7.25,
      name_y: 51.8,
      name_font_family: 'Helvetica-Bold',
      name_font_size: 38,
      name_color: '#111827',
      name_alignment: 'left',
      name_max_width: 60,
      date_x: 74.2,
      date_y: 82.5,
      date_font_family: 'Helvetica',
      date_font_size: 13,
      date_color: '#334155',
      date_alignment: 'left',
      updated_at: new Date().toISOString()
    }
  ],
  logs: [
    {
      id: 'log-001',
      session_id: 'ws-session-001',
      session_name: 'GitHub Workshop – Session 1 (Git & GitHub Fundamentals)',
      status: 'success',
      participant_name_masked: 'An*** Re***',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

function readLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SEED_DATA, null, 2), 'utf8');
      return DEFAULT_SEED_DATA;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading local data store:', err);
    return DEFAULT_SEED_DATA;
  }
}

function writeLocalStore(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to local data store:', err);
  }
}

// ----------------- Public Database API Methods -----------------

export async function getSessions() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('workshop_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const store = readLocalStore();
  return store.sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getSessionById(id) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('workshop_sessions')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  const store = readLocalStore();
  return store.sessions.find(s => s.id === id) || null;
}

export async function findSessionByAccessCode(rawCode) {
  if (!rawCode) return null;
  const hash = hashAccessCode(rawCode);

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('workshop_sessions')
      .select('*')
      .eq('access_code_hash', hash)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  const store = readLocalStore();
  const session = store.sessions.find(s => s.access_code_hash === hash);
  return session || null;
}

export async function createSession(sessionData) {
  const id = sessionData.id || `ws-${Date.now()}`;
  const accessCode = sessionData.access_code || 'GH-WS-' + Math.floor(1000 + Math.random() * 9000);
  const codeHash = hashAccessCode(accessCode);

  const newSession = {
    id,
    session_name: sessionData.session_name,
    session_date: sessionData.session_date,
    access_code_hash: codeHash,
    raw_code_for_admin: accessCode, // for admin reference
    is_active: sessionData.is_active !== undefined ? Boolean(sessionData.is_active) : true,
    certificate_template_path: sessionData.certificate_template_path || '/templates/gitopia-certificate.pdf',
    date_mode: sessionData.date_mode || 'auto_current',
    custom_date_text: sessionData.custom_date_text || '',
    timezone: sessionData.timezone || 'Asia/Kolkata',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const defaultLayout = {
    id: `layout-${Date.now()}`,
    session_id: id,
    name_x: 7.25,
    name_y: 51.8,
    name_font_family: 'Helvetica-Bold',
    name_font_size: 38,
    name_color: '#111827',
    name_alignment: 'left',
    name_max_width: 60,
    date_x: 74.2,
    date_y: 82.5,
    date_font_family: 'Helvetica',
    date_font_size: 13,
    date_color: '#334155',
    date_alignment: 'left',
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { error: sError } = await supabase
      .from('workshop_sessions')
      .insert([newSession]);
    if (sError) throw sError;

    await supabase.from('certificate_layouts').insert([defaultLayout]);
    return newSession;
  }

  const store = readLocalStore();
  store.sessions.push(newSession);
  store.layouts.push(defaultLayout);
  writeLocalStore(store);
  return newSession;
}

export async function updateSession(id, updates) {
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('workshop_sessions')
      .update({ ...updates, updated_at: updatedAt })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const store = readLocalStore();
  const index = store.sessions.findIndex(s => s.id === id);
  if (index === -1) return null;

  store.sessions[index] = {
    ...store.sessions[index],
    ...updates,
    updated_at: updatedAt
  };
  writeLocalStore(store);
  return store.sessions[index];
}

export async function deleteSession(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('workshop_sessions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  const store = readLocalStore();
  store.sessions = store.sessions.filter(s => s.id !== id);
  store.layouts = store.layouts.filter(l => l.session_id !== id);
  store.logs = store.logs.filter(l => l.session_id !== id);
  writeLocalStore(store);
  return true;
}

export async function getCertificateLayout(sessionId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('certificate_layouts')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  const store = readLocalStore();
  return store.layouts.find(l => l.session_id === sessionId) || null;
}

export async function saveCertificateLayout(sessionId, layoutData) {
  const updatedAt = new Date().toISOString();
  const payload = {
    ...layoutData,
    session_id: sessionId,
    updated_at: updatedAt
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('certificate_layouts')
      .upsert(payload, { onConflict: 'session_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const store = readLocalStore();
  const index = store.layouts.findIndex(l => l.session_id === sessionId);
  if (index >= 0) {
    store.layouts[index] = { ...store.layouts[index], ...payload };
  } else {
    store.layouts.push({ id: `layout-${Date.now()}`, ...payload });
  }
  writeLocalStore(store);
  return payload;
}

export async function logCertificateDownload(sessionId, sessionName, status = 'success', participantName = '') {
  const maskedName = participantName
    ? participantName.slice(0, 2) + '***' + (participantName.length > 4 ? ' ' + participantName.slice(-2) : '')
    : 'Anonymous';

  const logEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    session_id: sessionId,
    session_name: sessionName || 'Workshop Session',
    participant_name_masked: maskedName,
    status,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    await supabase.from('certificate_download_logs').insert([logEntry]);
    return logEntry;
  }

  const store = readLocalStore();
  if (!store.logs) store.logs = [];
  store.logs.unshift(logEntry);
  if (store.logs.length > 500) store.logs = store.logs.slice(0, 500);
  writeLocalStore(store);
  return logEntry;
}

export async function getDashboardStats() {
  const sessions = await getSessions();
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.is_active).length;
  const inactiveSessions = totalSessions - activeSessions;

  let totalDownloads = 0;
  if (isSupabaseConfigured) {
    const { count } = await supabase
      .from('certificate_download_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success');
    totalDownloads = count || 0;
  } else {
    const store = readLocalStore();
    totalDownloads = (store.logs || []).filter(l => l.status === 'success').length;
  }

  return {
    totalSessions,
    activeSessions,
    inactiveSessions,
    totalDownloads
  };
}

export async function getActivityLogs(limit = 50) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('certificate_download_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  const store = readLocalStore();
  return (store.logs || []).slice(0, limit);
}
