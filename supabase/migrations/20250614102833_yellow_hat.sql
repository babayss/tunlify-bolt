-- Tunlify Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP tokens table
CREATE TABLE IF NOT EXISTS otp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server locations table
CREATE TABLE IF NOT EXISTS server_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    region_code VARCHAR(10) UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tunnels table
CREATE TABLE IF NOT EXISTS tunnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subdomain VARCHAR(50) NOT NULL,
    target_ip INET NOT NULL,
    target_port INTEGER NOT NULL CHECK (target_port > 0 AND target_port <= 65535),
    location VARCHAR(10) NOT NULL REFERENCES server_locations(region_code),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subdomain, location)
);

-- Content pages table
CREATE TABLE IF NOT EXISTS content_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    lang VARCHAR(5) NOT NULL,
    title VARCHAR(255),
    content JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(type, lang)
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_client_id VARCHAR(255),
    google_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tunnels_user_id ON tunnels(user_id);
CREATE INDEX IF NOT EXISTS idx_tunnels_subdomain_location ON tunnels(subdomain, location);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_id ON otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_token ON otp_tokens(token);

-- Insert default admin user (password: 123456)
INSERT INTO users (email, password_hash, name, role, is_verified) 
VALUES (
    'admin@tunlify.net', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 
    'Admin User', 
    'admin', 
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default regular user (password: 123456)
INSERT INTO users (email, password_hash, name, role, is_verified) 
VALUES (
    'user@tunlify.net', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 
    'Regular User', 
    'user', 
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