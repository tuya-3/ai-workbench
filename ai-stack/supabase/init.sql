-- AI Workbench MVP - Simple PostgreSQL Schema
-- This is a simplified version for MVP testing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Samples table
CREATE TABLE IF NOT EXISTS samples (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT'{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_samples_user_id ON samples(user_id);
CREATE INDEX IF NOT EXISTS idx_samples_created_at ON samples(created_at DESC);

-- Insert sample data for testing
INSERT INTO users (email, full_name) VALUES
    ('test@example.com', 'Test User'),
    ('admin@example.com', 'Admin User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO samples (user_id, title, content) 
SELECT id, 'Sample Entry', 'This is a sample data entry for testing.'
FROM users WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

