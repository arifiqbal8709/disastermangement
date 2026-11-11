-- ====================================================================
-- RESILIENCE AI – Disaster Memory & Preparedness Intelligence System
-- 001_initial_schema.sql
-- Complete Supabase PostgreSQL Schema with 14 Structured Tables & RLS
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Administrative Authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(255) DEFAULT 'Disaster Management Authority',
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DISTRICTS TABLE
CREATE TABLE IF NOT EXISTS districts (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  state VARCHAR(100) NOT NULL,
  primary_hazard VARCHAR(100) NOT NULL,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  source_key VARCHAR(100) DEFAULT 'ASDMA_DDMP',
  historical_events_summary TEXT,
  vulnerable_routes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DISASTER REPORTS (Official PDF Documents)
CREATE TABLE IF NOT EXISTS disaster_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'analyzed', 'failed')),
  extracted_text TEXT,
  authority VARCHAR(255) DEFAULT 'Disaster Management Authority',
  published_year VARCHAR(10),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. REPORT ANALYSES (Structured Gemini AI Extracted Intelligence)
CREATE TABLE IF NOT EXISTS report_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID UNIQUE REFERENCES disaster_reports(id) ON DELETE CASCADE,
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  disaster_type VARCHAR(100) NOT NULL,
  location_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  findings_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_factors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  resource_gaps_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_information_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  historical_comparison_json JSONB DEFAULT '{}'::jsonb,
  model_name VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  confidence_score NUMERIC(5, 2) DEFAULT 90.0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. HISTORICAL INCIDENTS (Centralized Disaster Memory)
CREATE TABLE IF NOT EXISTS historical_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  disaster_type VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(150) NOT NULL,
  incident_year INTEGER NOT NULL,
  incident_date DATE,
  impact_summary TEXT NOT NULL,
  damage_information TEXT,
  infrastructure_impact TEXT,
  response_actions TEXT,
  source_name VARCHAR(255) NOT NULL,
  source_url TEXT,
  verification_status VARCHAR(50) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DISASTER EVENTS
CREATE TABLE IF NOT EXISTS disaster_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  hazard_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'High',
  event_date DATE,
  details TEXT,
  source VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SHELTERS TABLE (Verified Relief Shelters & Elevated Platforms)
CREATE TABLE IF NOT EXISTS shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  district VARCHAR(150) NOT NULL,
  state VARCHAR(100) DEFAULT 'Assam',
  shelter_type VARCHAR(150) NOT NULL,
  capacity INTEGER DEFAULT 500,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  source VARCHAR(255) DEFAULT 'ASDMA',
  source_url TEXT DEFAULT 'https://asdma.assam.gov.in',
  verified_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  bed_capacity INTEGER DEFAULT 100,
  emergency_icu_beds INTEGER DEFAULT 15,
  trauma_center BOOLEAN DEFAULT TRUE,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  contact_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. EMERGENCY RESOURCES
CREATE TABLE IF NOT EXISTS emergency_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  resource_type VARCHAR(150) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'units',
  operational_status VARCHAR(50) DEFAULT 'Operational',
  agency VARCHAR(255) DEFAULT 'SDRF',
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. PREPAREDNESS SCORES (Transparent Multi-indicator Computation)
CREATE TABLE IF NOT EXISTS preparedness_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  hazard_type VARCHAR(100) NOT NULL,
  warning_score NUMERIC(5, 2),
  shelter_score NUMERIC(5, 2),
  evacuation_score NUMERIC(5, 2),
  medical_score NUMERIC(5, 2),
  composite_score NUMERIC(5, 2),
  risk_level VARCHAR(50) DEFAULT 'Moderate Risk',
  is_verified BOOLEAN DEFAULT TRUE,
  notes TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (district_id, hazard_type)
);

-- 11. ACTION PLANS (Actionable Preparedness Directives)
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  hazard_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  immediate_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  mid_term_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority VARCHAR(50) DEFAULT 'High',
  supporting_evidence TEXT,
  source_references TEXT,
  generated_by VARCHAR(100) DEFAULT 'RESILIENCE AI Gemini Engine',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. DATA SOURCES REGISTRY
CREATE TABLE IF NOT EXISTS data_sources (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  authority VARCHAR(150) NOT NULL,
  hazard VARCHAR(100) NOT NULL,
  coverage VARCHAR(150) NOT NULL,
  data_type VARCHAR(150) NOT NULL,
  status VARCHAR(50) DEFAULT 'Connected',
  source_url TEXT,
  last_retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. UPLOADED DATASETS
CREATE TABLE IF NOT EXISTS uploaded_datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255),
  file_format VARCHAR(50) NOT NULL,
  record_count INTEGER DEFAULT 0,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. AUDIT LOGS (Security & Operational Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  ip_address VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state);
CREATE INDEX IF NOT EXISTS idx_districts_hazard ON districts(primary_hazard);
CREATE INDEX IF NOT EXISTS idx_incidents_district ON historical_incidents(district);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON historical_incidents(disaster_type);
CREATE INDEX IF NOT EXISTS idx_incidents_year ON historical_incidents(incident_year);
CREATE INDEX IF NOT EXISTS idx_shelters_district ON shelters(district);
CREATE INDEX IF NOT EXISTS idx_shelters_coords ON shelters(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals(district_id);
CREATE INDEX IF NOT EXISTS idx_scores_district_hazard ON preparedness_scores(district_id, hazard_type);
CREATE INDEX IF NOT EXISTS idx_action_plans_district ON action_plans(district_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read verified information (districts, historical_incidents, shelters)
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Districts" ON districts FOR SELECT USING (true);

ALTER TABLE historical_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Verified Incidents" ON historical_incidents FOR SELECT USING (verification_status = 'verified');

ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Shelters" ON shelters FOR SELECT USING (true);

ALTER TABLE preparedness_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Scores" ON preparedness_scores FOR SELECT USING (true);

ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Plans" ON action_plans FOR SELECT USING (true);
