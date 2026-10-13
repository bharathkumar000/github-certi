-- ==============================================================================
-- Certify – Workshop Certificate Generator
-- Supabase PostgreSQL Database Schema & Initial Data
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Workshop Sessions Table
CREATE TABLE IF NOT EXISTS workshop_sessions (
  id TEXT PRIMARY KEY DEFAULT ('ws-' || extract(epoch from now())::bigint::text),
  session_name TEXT NOT NULL,
  session_date DATE NOT NULL,
  access_code_hash TEXT NOT NULL,
  raw_code_for_admin TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  certificate_template_path TEXT DEFAULT '/templates/gitopia-certificate.pdf',
  date_mode TEXT NOT NULL DEFAULT 'auto_current', -- 'auto_current' or 'custom'
  custom_date_text TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Certificate Layouts Table
CREATE TABLE IF NOT EXISTS certificate_layouts (
  id TEXT PRIMARY KEY DEFAULT ('layout-' || extract(epoch from now())::bigint::text),
  session_id TEXT NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE UNIQUE,
  name_x NUMERIC NOT NULL DEFAULT 7.25,      -- % horizontal position (0-100)
  name_y NUMERIC NOT NULL DEFAULT 51.8,      -- % vertical position (0-100)
  name_font_family TEXT NOT NULL DEFAULT 'Helvetica-Bold',
  name_font_size NUMERIC NOT NULL DEFAULT 38,
  name_color TEXT NOT NULL DEFAULT '#111827',
  name_alignment TEXT NOT NULL DEFAULT 'left', -- 'left', 'center', 'right'
  name_max_width NUMERIC NOT NULL DEFAULT 60,
  date_x NUMERIC NOT NULL DEFAULT 74.2,
  date_y NUMERIC NOT NULL DEFAULT 82.5,
  date_font_family TEXT NOT NULL DEFAULT 'Helvetica',
  date_font_size NUMERIC NOT NULL DEFAULT 13,
  date_color TEXT NOT NULL DEFAULT '#334155',
  date_alignment TEXT NOT NULL DEFAULT 'left',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Certificate Download Logs Table
CREATE TABLE IF NOT EXISTS certificate_download_logs (
  id TEXT PRIMARY KEY DEFAULT ('log-' || extract(epoch from now())::bigint::text),
  session_id TEXT NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
  session_name TEXT,
  participant_name_masked TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Admin Profiles Table (for Supabase Auth integration)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_is_active ON workshop_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_code_hash ON workshop_sessions(access_code_hash);
CREATE INDEX IF NOT EXISTS idx_certificate_layouts_session_id ON certificate_layouts(session_id);
CREATE INDEX IF NOT EXISTS idx_certificate_download_logs_session_id ON certificate_download_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_certificate_download_logs_created_at ON certificate_download_logs(created_at);

-- 7. Automated updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_workshop_sessions_updated_at ON workshop_sessions;
CREATE TRIGGER trg_update_workshop_sessions_updated_at
  BEFORE UPDATE ON workshop_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_certificate_layouts_updated_at ON certificate_layouts;
CREATE TRIGGER trg_update_certificate_layouts_updated_at
  BEFORE UPDATE ON certificate_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Row Level Security (RLS) Setup
ALTER TABLE workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to avoid duplicates
DROP POLICY IF EXISTS "Public can view active sessions" ON workshop_sessions;
DROP POLICY IF EXISTS "Public can view layouts" ON certificate_layouts;
DROP POLICY IF EXISTS "Public can insert download logs" ON certificate_download_logs;
DROP POLICY IF EXISTS "Service role has full access to sessions" ON workshop_sessions;
DROP POLICY IF EXISTS "Service role has full access to layouts" ON certificate_layouts;
DROP POLICY IF EXISTS "Service role has full access to logs" ON certificate_download_logs;
DROP POLICY IF EXISTS "Service role has full access to admin_profiles" ON admin_profiles;

-- Policies for Participant Portal & Verification (anon + authenticated)
CREATE POLICY "Public can view active sessions"
  ON workshop_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view layouts"
  ON certificate_layouts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert download logs"
  ON certificate_download_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Full access policies for Service Role / Admin Backend
CREATE POLICY "Service role has full access to sessions"
  ON workshop_sessions FOR ALL
  TO service_role, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to layouts"
  ON certificate_layouts FOR ALL
  TO service_role, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to logs"
  ON certificate_download_logs FOR ALL
  TO service_role, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to admin_profiles"
  ON admin_profiles FOR ALL
  TO service_role, authenticated
  USING (true)
  WITH CHECK (true);

-- 9. Seed Initial Default Session & Certificate Layout
-- Default Session: GH-OCT-2026 (SHA-256 hash: 8d16025e677a25c0b8b4e1f8f253674b2584ee35dfbefae960d657591a29f3d5)
INSERT INTO workshop_sessions (
  id,
  session_name,
  session_date,
  access_code_hash,
  raw_code_for_admin,
  is_active,
  certificate_template_path,
  date_mode,
  custom_date_text,
  timezone
)
VALUES (
  'ws-session-001',
  'GitHub Workshop – Session 1 (Git & GitHub Fundamentals)',
  CURRENT_DATE,
  '8d16025e677a25c0b8b4e1f8f253674b2584ee35dfbefae960d657591a29f3d5',
  'GH-OCT-2026',
  true,
  '/templates/gitopia-certificate.pdf',
  'auto_current',
  '',
  'Asia/Kolkata'
)
ON CONFLICT (id) DO UPDATE SET
  session_name = EXCLUDED.session_name,
  access_code_hash = EXCLUDED.access_code_hash,
  raw_code_for_admin = EXCLUDED.raw_code_for_admin,
  certificate_template_path = EXCLUDED.certificate_template_path;

-- Default Layout calibrated for gitopia-certificate.pdf
INSERT INTO certificate_layouts (
  id,
  session_id,
  name_x,
  name_y,
  name_font_family,
  name_font_size,
  name_color,
  name_alignment,
  name_max_width,
  date_x,
  date_y,
  date_font_family,
  date_font_size,
  date_color,
  date_alignment
)
VALUES (
  'layout-001',
  'ws-session-001',
  7.25,
  51.8,
  'Helvetica-Bold',
  38,
  '#111827',
  'left',
  60,
  74.2,
  82.5,
  'Helvetica',
  13,
  '#334155',
  'left'
)
ON CONFLICT (session_id) DO UPDATE SET
  name_x = EXCLUDED.name_x,
  name_y = EXCLUDED.name_y,
  name_alignment = EXCLUDED.name_alignment,
  name_font_size = EXCLUDED.name_font_size,
  date_x = EXCLUDED.date_x,
  date_y = EXCLUDED.date_y,
  date_font_size = EXCLUDED.date_font_size;
