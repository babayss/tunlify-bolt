-- Supabase Database Seed
-- This file contains the database schema and initial data for Tunlify

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS otp_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS server_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region_code text UNIQUE NOT NULL,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tunnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subdomain text UNIQUE NOT NULL,
  target_ip text NOT NULL,
  target_port integer NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  lang text NOT NULL,
  title text,
  content jsonb NOT NULL,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(type, lang)
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_client_id text,
  google_secret text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tunnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for otp_tokens table
CREATE POLICY "Users can read own OTP tokens" ON otp_tokens
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own OTP tokens" ON otp_tokens
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- RLS Policies for server_locations table (public read)
CREATE POLICY "Anyone can read server locations" ON server_locations
  FOR SELECT TO public USING (true);

-- RLS Policies for tunnels table
CREATE POLICY "Users can read own tunnels" ON tunnels
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own tunnels" ON tunnels
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own tunnels" ON tunnels
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own tunnels" ON tunnels
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- RLS Policies for content_pages table (public read)
CREATE POLICY "Anyone can read content pages" ON content_pages
  FOR SELECT TO public USING (true);

-- RLS Policies for admin_settings table (admin only)
CREATE POLICY "Only admins can read settings" ON admin_settings
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Insert seed data

-- 1. Insert users (admin and regular user)
-- Password hash for '123456' using bcrypt with salt rounds 12
INSERT INTO users (email, password_hash, name, role, is_verified) VALUES
('admin@tunlify.net', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2opQOA4O', 'Admin User', 'admin', true),
('user@tunlify.net', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2opQOA4O', 'Regular User', 'user', true);

-- 2. Insert server locations
INSERT INTO server_locations (name, region_code, ip_address) VALUES
('Singapore', 'sg', '103.28.248.1'),
('Jakarta', 'id', '103.28.248.2'),
('Tokyo', 'jp', '103.28.248.3'),
('Sydney', 'au', '103.28.248.4'),
('Mumbai', 'in', '103.28.248.5'),
('Frankfurt', 'de', '103.28.248.6'),
('London', 'gb', '103.28.248.7'),
('New York', 'us-east', '103.28.248.8'),
('San Francisco', 'us-west', '103.28.248.9'),
('Toronto', 'ca', '103.28.248.10');

-- 3. Insert admin settings
INSERT INTO admin_settings (google_client_id, google_secret) VALUES
(NULL, NULL);

-- 4. Insert sample content pages (English)
INSERT INTO content_pages (type, lang, title, content) VALUES
('landing', 'en', 'Landing Page Content', '{
  "hero": {
    "title": "Secure & Fast Tunneling Service",
    "subtitle": "Connect your local applications to the internet with our reliable tunneling service. Get started in minutes.",
    "cta_primary": "Get Started",
    "cta_secondary": "Learn More"
  },
  "features": [
    {
      "icon": "Shield",
      "title": "Secure Connection",
      "description": "End-to-end encryption for all your connections"
    },
    {
      "icon": "Zap",
      "title": "Lightning Fast",
      "description": "Optimized servers worldwide for minimal latency"
    },
    {
      "icon": "Globe",
      "title": "Reliable Service",
      "description": "99.9% uptime guarantee with 24/7 monitoring"
    }
  ],
  "stats": [
    {"number": "99.9%", "label": "Uptime"},
    {"number": "50+", "label": "Countries"},
    {"number": "24/7", "label": "Support"},
    {"number": "1M+", "label": "Users"}
  ],
  "testimonials": [
    {
      "name": "John Doe",
      "role": "Developer",
      "content": "Tunlify has been a game-changer for our development workflow.",
      "rating": 5
    },
    {
      "name": "Jane Smith",
      "role": "DevOps Engineer",
      "content": "Reliable, fast, and secure. Everything we need in a tunneling service.",
      "rating": 5
    }
  ]
}');

-- 5. Insert sample content pages (Indonesian)
INSERT INTO content_pages (type, lang, title, content) VALUES
('landing', 'id', 'Konten Halaman Utama', '{
  "hero": {
    "title": "Layanan Tunneling Aman & Cepat",
    "subtitle": "Hubungkan aplikasi lokal Anda ke internet dengan layanan tunneling yang handal. Mulai dalam hitungan menit.",
    "cta_primary": "Mulai Sekarang",
    "cta_secondary": "Pelajari Lebih Lanjut"
  },
  "features": [
    {
      "icon": "Shield",
      "title": "Koneksi Aman",
      "description": "Enkripsi end-to-end untuk semua koneksi Anda"
    },
    {
      "icon": "Zap",
      "title": "Sangat Cepat",
      "description": "Server yang dioptimalkan di seluruh dunia untuk latensi minimal"
    },
    {
      "icon": "Globe",
      "title": "Layanan Handal",
      "description": "Jaminan uptime 99.9% dengan monitoring 24/7"
    }
  ],
  "stats": [
    {"number": "99.9%", "label": "Uptime"},
    {"number": "50+", "label": "Negara"},
    {"number": "24/7", "label": "Dukungan"},
    {"number": "1M+", "label": "Pengguna"}
  ],
  "testimonials": [
    {
      "name": "John Doe",
      "role": "Developer",
      "content": "Tunlify telah mengubah alur kerja pengembangan kami.",
      "rating": 5
    },
    {
      "name": "Jane Smith",
      "role": "DevOps Engineer",
      "content": "Handal, cepat, dan aman. Semua yang kami butuhkan dalam layanan tunneling.",
      "rating": 5
    }
  ]
}');

-- 6. Insert pricing content (English)
INSERT INTO content_pages (type, lang, title, content) VALUES
('pricing', 'en', 'Pricing Plans', '{
  "title": "Choose the Right Plan",
  "subtitle": "Start free, upgrade anytime as your needs grow.",
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "period": "/month",
      "description": "Perfect for getting started",
      "features": [
        "1 active tunnel",
        "1GB bandwidth/month",
        "Free subdomain",
        "Email support"
      ],
      "popular": false,
      "cta": "Start Free"
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 10,
      "period": "/month",
      "description": "For professional developers",
      "features": [
        "5 active tunnels",
        "50GB bandwidth/month",
        "Custom domain",
        "Free SSL",
        "Priority support",
        "Advanced analytics"
      ],
      "popular": true,
      "cta": "Choose Pro"
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 50,
      "period": "/month",
      "description": "For teams and companies",
      "features": [
        "Unlimited tunnels",
        "Unlimited bandwidth",
        "Multiple custom domains",
        "24/7 support",
        "99.9% SLA",
        "Team management",
        "API access"
      ],
      "popular": false,
      "cta": "Contact Sales"
    }
  ]
}');

-- 7. Insert pricing content (Indonesian)
INSERT INTO content_pages (type, lang, title, content) VALUES
('pricing', 'id', 'Paket Harga', '{
  "title": "Pilih Paket yang Tepat",
  "subtitle": "Mulai gratis, upgrade kapan saja sesuai kebutuhan Anda.",
  "plans": [
    {
      "id": "free",
      "name": "Gratis",
      "price": 0,
      "period": "/bulan",
      "description": "Sempurna untuk memulai",
      "features": [
        "1 tunnel aktif",
        "Bandwidth 1GB/bulan",
        "Subdomain gratis",
        "Dukungan email"
      ],
      "popular": false,
      "cta": "Mulai Gratis"
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 10,
      "period": "/bulan",
      "description": "Untuk developer professional",
      "features": [
        "5 tunnel aktif",
        "Bandwidth 50GB/bulan",
        "Custom domain",
        "SSL gratis",
        "Prioritas dukungan",
        "Analitik lanjutan"
      ],
      "popular": true,
      "cta": "Pilih Pro"
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 50,
      "period": "/bulan",
      "description": "Untuk tim dan perusahaan",
      "features": [
        "Tunnel unlimited",
        "Bandwidth unlimited",
        "Multiple custom domain",
        "Dukungan 24/7",
        "SLA 99.9%",
        "Manajemen tim",
        "API akses"
      ],
      "popular": false,
      "cta": "Hubungi Sales"
    }
  ]
}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_id ON otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_token ON otp_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tunnels_user_id ON tunnels(user_id);
CREATE INDEX IF NOT EXISTS idx_tunnels_subdomain ON tunnels(subdomain);
CREATE INDEX IF NOT EXISTS idx_tunnels_status ON tunnels(status);
CREATE INDEX IF NOT EXISTS idx_content_pages_type_lang ON content_pages(type, lang);
CREATE INDEX IF NOT EXISTS idx_server_locations_region_code ON server_locations(region_code);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';