-- Supabase Database Schema for JobApply

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CVs table
CREATE TABLE IF NOT EXISTS cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content TEXT, -- Extracted text from PDF
  skills TEXT[], -- Extracted skills from CV
  experience TEXT, -- Summary of experience
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  job_url TEXT,
  status VARCHAR(50) DEFAULT 'applied', -- applied, in_review, interview, offered, rejected
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Cover Letters table
CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Offers (scraped from various platforms)
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL, -- linkedin, indeed, etc.
  platform_id VARCHAR(255) UNIQUE NOT NULL,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  salary_range VARCHAR(255),
  requirements TEXT[],
  url TEXT NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- User Job Matches (matching between user CV and job offers)
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  job_offer_id UUID REFERENCES job_offers(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'new', -- new, viewed, applied, dismissed
  UNIQUE(user_id, job_offer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_application_id ON cover_letters(application_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_platform ON job_offers(platform);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cvs_updated_at BEFORE UPDATE ON cvs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can view own CVs" ON cvs
    FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = cvs.user_id));

CREATE POLICY "Users can insert own CVs" ON cvs
    FOR INSERT WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = cvs.user_id));

CREATE POLICY "Users can update own CVs" ON cvs
    FOR UPDATE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = cvs.user_id));

CREATE POLICY "Users can delete own CVs" ON cvs
    FOR DELETE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = cvs.user_id));

CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = applications.user_id));

CREATE POLICY "Users can insert own applications" ON applications
    FOR INSERT WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = applications.user_id));

CREATE POLICY "Users can update own applications" ON applications
    FOR UPDATE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = applications.user_id));

CREATE POLICY "Users can delete own applications" ON applications
    FOR DELETE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = applications.user_id));

CREATE POLICY "Users can view own cover letters" ON cover_letters
    FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = cover_letters.user_id));

CREATE POLICY "Users can insert own cover letters" ON cover_letters
    FOR INSERT WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = cover_letters.user_id));

CREATE POLICY "Users can view own job matches" ON job_matches
    FOR SELECT USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = job_matches.user_id));

CREATE POLICY "Users can update own job matches" ON job_matches
    FOR UPDATE USING (auth.uid()::text = (SELECT clerk_id FROM users WHERE id = job_matches.user_id));
