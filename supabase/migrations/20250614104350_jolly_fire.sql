/*
  # Tunlify Database Schema Migration

  1. New Tables
    - `users` - User accounts with authentication
    - `otp_tokens` - Email verification tokens
    - `server_locations` - Available tunnel server locations
    - `tunnels` - User tunnel configurations
    - `content_pages` - CMS content for landing/pricing pages
    - `admin_settings` - Application settings

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Admin-only access for management tables

  3. Default Data
    - Default admin user
    - Sample server locations
    - No example tunnels or content
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text,
    name text NOT NULL,
    role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
    ON users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- OTP tokens table
CREATE TABLE IF NOT EXISTS otp_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL,
    expires_at timestamptz NOT NULL,
    verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_tokens ENABLE ROW LEVEL SECURITY;

-- Users can access their own OTP tokens
CREATE POLICY "Users can access own OTP tokens"
    ON otp_tokens
    FOR ALL
    TO authenticated
    USING (user_id::text = auth.uid()::text);

-- Server locations table
CREATE TABLE IF NOT EXISTS server_locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    region_code text UNIQUE NOT NULL,
    ip_address inet NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE server_locations ENABLE ROW LEVEL SECURITY;

-- Anyone can read server locations
CREATE POLICY "Anyone can read server locations"
    ON server_locations
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can manage server locations
CREATE POLICY "Admins can manage server locations"
    ON server_locations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Tunnels table
CREATE TABLE IF NOT EXISTS tunnels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subdomain text NOT NULL,
    target_ip inet NOT NULL,
    target_port integer NOT NULL CHECK (target_port > 0 AND target_port <= 65535),
    location text NOT NULL REFERENCES server_locations(region_code),
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(subdomain, location)
);

ALTER TABLE tunnels ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tunnels
CREATE POLICY "Users can manage own tunnels"
    ON tunnels
    FOR ALL
    TO authenticated
    USING (user_id::text = auth.uid()::text);

-- Admins can read all tunnels
CREATE POLICY "Admins can read all tunnels"
    ON tunnels
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Content pages table
CREATE TABLE IF NOT EXISTS content_pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    lang text NOT NULL,
    title text,
    content jsonb NOT NULL,
    last_updated timestamptz DEFAULT now(),
    UNIQUE(type, lang)
);

ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read content pages
CREATE POLICY "Anyone can read content pages"
    ON content_pages
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can manage content pages
CREATE POLICY "Admins can manage content pages"
    ON content_pages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    google_client_id text,
    google_secret text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access settings
CREATE POLICY "Admins can access settings"
    ON admin_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tunnels_user_id ON tunnels(user_id);
CREATE INDEX IF NOT EXISTS idx_tunnels_subdomain_location ON tunnels(subdomain, location);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_id ON otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_token ON otp_tokens(token);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, is_verified) 
VALUES (
    'admin@tunlify.net', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 
    'Admin User', 
    'admin', 
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default server locations
INSERT INTO server_locations (name, region_code, ip_address) VALUES
    ('Indonesia - Jakarta', 'id', '103.127.132.1'),
    ('Singapore', 'sg', '103.127.132.2'),
    ('United States - New York', 'us', '103.127.132.3'),
    ('Germany - Frankfurt', 'de', '103.127.132.4'),
    ('Japan - Tokyo', 'jp', '103.127.132.5')
ON CONFLICT (region_code) DO NOTHING;