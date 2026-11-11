-- ====================================================================
-- RESILIENCE AI – Disaster Memory & Preparedness Intelligence System
-- 003_advanced_features.sql
-- Migration for 10 Advanced Capabilities:
-- 1. AI Disaster Risk Intelligence
-- 2. Historical Disaster Memory Engine
-- 3. Smart Rescue and Resource Allocation
-- 4. What-If Disaster Scenario Simulator
-- 5. Multilingual AI Assistant Audits
-- 6. Offline Emergency SOS Prototype
-- 7. Live Verified Disaster Alert Center
-- 8. Missing Person Registry
-- 9. Disaster Damage Assessment
-- 10. Relief Distribution Tracking
-- ====================================================================

-- 1. LIVE VERIFIED DISASTER ALERTS (CAP Compliant)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cap_identifier VARCHAR(100) UNIQUE NOT NULL,
  headline VARCHAR(255) NOT NULL,
  event VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('Red', 'Orange', 'Yellow', 'Green')),
  urgency VARCHAR(50) DEFAULT 'Immediate',
  certainty VARCHAR(50) DEFAULT 'Observed',
  effective TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires TIMESTAMP WITH TIME ZONE,
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE SET NULL,
  district_name VARCHAR(150),
  state VARCHAR(100) NOT NULL,
  area_description TEXT,
  instruction TEXT,
  source_agency VARCHAR(100) NOT NULL, -- IMD, CWC, ASDMA, NDMA, GSI
  bulletin_url TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DISASTER MEMORY & LESSONS LEARNED
CREATE TABLE IF NOT EXISTS disaster_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id VARCHAR(100) REFERENCES historical_incidents(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  disaster_type VARCHAR(100) NOT NULL,
  incident_year INT NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(150) NOT NULL,
  failure_modes JSONB DEFAULT '[]'::jsonb, -- e.g., ["Embankment piping", "Siren delay"]
  lessons_learned JSONB DEFAULT '[]'::jsonb,
  actionable_protocols JSONB DEFAULT '[]'::jsonb,
  source_report VARCHAR(255),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WHAT-IF SCENARIOS
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,
  disaster_type VARCHAR(100) NOT NULL,
  rainfall_surge_pct INT DEFAULT 0,
  dam_discharge_cumec INT DEFAULT 0,
  embankment_breach BOOLEAN DEFAULT FALSE,
  duration_hours INT DEFAULT 24,
  projected_flood_depth_meters NUMERIC(5, 2),
  projected_area_submerged_sqkm NUMERIC(8, 2),
  estimated_population_at_risk INT,
  shelter_demand_pct NUMERIC(5, 2),
  required_ndrf_teams INT,
  required_rescue_boats INT,
  ai_simulation_summary TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AI DISASTER RISK INTELLIGENCE LOGS
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  hazard_type VARCHAR(100) NOT NULL,
  risk_tier VARCHAR(50) NOT NULL CHECK (risk_tier IN ('Extreme', 'High', 'Moderate', 'Low')),
  composite_score NUMERIC(5, 2) NOT NULL,
  hydrological_vulnerability NUMERIC(5, 2),
  structural_vulnerability NUMERIC(5, 2),
  evacuation_vulnerability NUMERIC(5, 2),
  demographic_exposure NUMERIC(5, 2),
  key_findings JSONB DEFAULT '[]'::jsonb,
  mitigation_directives JSONB DEFAULT '[]'::jsonb,
  model_name VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SMART RESCUE & RESOURCE ALLOCATIONS
CREATE TABLE IF NOT EXISTS smart_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  priority_tier VARCHAR(50) DEFAULT 'Urgent',
  ndrf_teams_assigned INT DEFAULT 0,
  sdrf_teams_assigned INT DEFAULT 0,
  rescue_boats_assigned INT DEFAULT 0,
  dewatering_pumps_assigned INT DEFAULT 0,
  medical_teams_assigned INT DEFAULT 0,
  target_staging_area VARCHAR(255),
  dispatch_status VARCHAR(50) DEFAULT 'Planned' CHECK (dispatch_status IN ('Planned', 'Dispatched', 'On-Site', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MISSING PERSON REGISTRY
CREATE TABLE IF NOT EXISTS missing_persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  age INT,
  gender VARCHAR(50),
  photo_url TEXT,
  last_seen_location VARCHAR(255) NOT NULL,
  last_seen_district VARCHAR(150) NOT NULL,
  last_seen_date DATE NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  current_status VARCHAR(50) DEFAULT 'Reported' CHECK (current_status IN ('Reported', 'Tracing', 'In Relief Shelter', 'Hospitalized', 'Safely Reunited', 'Deceased')),
  shelter_assigned_id VARCHAR(100) REFERENCES shelters(id) ON DELETE SET NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RAPID DAMAGE ASSESSMENTS (RDA)
CREATE TABLE IF NOT EXISTS damage_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  block_name VARCHAR(150) NOT NULL,
  damage_category VARCHAR(100) NOT NULL CHECK (damage_category IN ('Residential Housing', 'Road Network', 'Bridge / Culvert', 'Embankment / Dyke', 'School / Hospital', 'Power Grid', 'Agriculture / Crop')),
  damage_level VARCHAR(50) NOT NULL CHECK (damage_level IN ('Fully Destroyed', 'Severely Damaged', 'Partially Damaged', 'Inundated')),
  units_affected INT DEFAULT 1,
  estimated_loss_inr NUMERIC(15, 2) DEFAULT 0,
  evidence_photo_url TEXT,
  gps_latitude NUMERIC(10, 6),
  gps_longitude NUMERIC(10, 6),
  inspector_name VARCHAR(255),
  verification_status VARCHAR(50) DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'SDRF Compensation Approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. RELIEF DISTRIBUTION INVENTORY
CREATE TABLE IF NOT EXISTS relief_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id VARCHAR(100) REFERENCES districts(id) ON DELETE CASCADE,
  shelter_id VARCHAR(100) REFERENCES shelters(id) ON DELETE SET NULL,
  item_name VARCHAR(150) NOT NULL, -- e.g. "Dry Ration Kits", "Baby Food Units", "Water Bottles 1L", "Tarpaulin Sheets"
  category VARCHAR(100) NOT NULL CHECK (category IN ('Food & Nutrition', 'Drinking Water', 'Shelter & Bedding', 'Medical Supplies', 'Hygiene Kits')),
  total_received INT NOT NULL DEFAULT 0,
  total_distributed INT NOT NULL DEFAULT 0,
  remaining_stock INT GENERATED ALWAYS AS (total_received - total_distributed) STORED,
  unit_of_measure VARCHAR(50) DEFAULT 'Units',
  daily_consumption_rate INT DEFAULT 0,
  stock_status VARCHAR(50) GENERATED ALWAYS AS (
    CASE 
      WHEN (total_received - total_distributed) <= 50 THEN 'Critical Shortage'
      WHEN (total_received - total_distributed) <= 200 THEN 'Low Stock'
      ELSE 'Adequate'
    END
  ) STORED,
  last_delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. OFFLINE EMERGENCY SOS SIGNALS
CREATE TABLE IF NOT EXISTS sos_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  sender_name VARCHAR(255) DEFAULT 'Anonymous Citizen',
  phone_number VARCHAR(50),
  people_count INT DEFAULT 1,
  medical_emergency BOOLEAN DEFAULT FALSE,
  water_surrounding BOOLEAN DEFAULT FALSE,
  battery_level_pct INT,
  signal_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rescue_status VARCHAR(50) DEFAULT 'Active Distress' CHECK (rescue_status IN ('Active Distress', 'Rescue Team Dispatched', 'Safely Evacuated')),
  assigned_team VARCHAR(255)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_district ON alerts(district_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_district ON scenarios(district_id);
CREATE INDEX IF NOT EXISTS idx_missing_status ON missing_persons(current_status);
CREATE INDEX IF NOT EXISTS idx_damage_district ON damage_assessments(district_id);
CREATE INDEX IF NOT EXISTS idx_relief_shelter ON relief_inventory(shelter_id);
CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_signals(rescue_status);

