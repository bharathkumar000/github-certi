-- GitHub Workshop Certificate Generator Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Admin Profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Workshop Sessions
CREATE TABLE IF NOT EXISTS workshop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  session_date DATE NOT NULL,
  access_code_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  certificate_template_path TEXT,
  date_mode TEXT NOT NULL DEFAULT 'auto_current', -- 'auto_current' or 'custom'
  custom_date_text TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Certificate Layouts
CREATE TABLE IF NOT EXISTS certificate_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE UNIQUE,
  name_x NUMERIC NOT NULL DEFAULT 50, -- % horizontal position (0-100)
  name_y NUMERIC NOT NULL DEFAULT 48, -- % vertical position (0-100)
  name_font_family TEXT NOT NULL DEFAULT 'Times-Bold', -- Standard PDF fonts: Times-Bold, Helvetica-Bold, Courier-Bold
  name_font_size NUMERIC NOT NULL DEFAULT 36,
  name_color TEXT NOT NULL DEFAULT '#111827',
  name_alignment TEXT NOT NULL DEFAULT 'center', -- 'left', 'center', 'right'
  name_max_width NUMERIC NOT NULL DEFAULT 70, -- % max width for auto-scaling
  date_x NUMERIC NOT NULL DEFAULT 28,
  date_y NUMERIC NOT NULL DEFAULT 78,
  date_font_family TEXT NOT NULL DEFAULT 'Helvetica',
  date_font_size NUMERIC NOT NULL DEFAULT 16,
  date_color TEXT NOT NULL DEFAULT '#4b5563',
  date_alignment TEXT NOT NULL DEFAULT 'center',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Certificate Download Logs
CREATE TABLE IF NOT EXISTS certificate_download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
  participant_name_masked TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_is_active ON workshop_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_certificate_layouts_session_id ON certificate_layouts(session_id);
CREATE INDEX IF NOT EXISTS idx_certificate_download_logs_session_id ON certificate_download_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_certificate_download_logs_created_at ON certificate_download_logs(created_at);

-- Automatic Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workshop_sessions_updated_at
  BEFORE UPDATE ON workshop_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificate_layouts_updated_at
  BEFORE UPDATE ON certificate_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_download_logs ENABLE ROW LEVEL SECURITY;

-- Admin access policy
CREATE POLICY "Admins have full access to admin_profiles"
  ON admin_profiles
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to workshop_sessions"
  ON workshop_sessions
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins have full access to certificate_layouts"
  ON certificate_layouts
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins have full access to certificate_download_logs"
  ON certificate_download_logs
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid()));

-- Storage Bucket for Certificate Templates (if using Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificate-templates', 'certificate-templates', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload templates"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'certificate-templates');
