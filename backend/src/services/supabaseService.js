import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

// In-Memory Seed Storage for Instant Development / Testing
const initialDistricts = [
  { id: 'dhemaji', name: 'Dhemaji', state: 'Assam', primary_hazard: 'Flood', latitude: 27.4847, longitude: 94.5774, source_key: 'ASDMA_FLOOD_ATLAS', historical_events_summary: '2024 Jiadhal Basin Flash Flood: Heavy siltation across 45 villages.', vulnerable_routes: 'NH-15 low-lying bridge sections' },
  { id: 'cachar', name: 'Cachar', state: 'Assam', primary_hazard: 'Flood', latitude: 24.8333, longitude: 92.7789, source_key: 'ASDMA_FLOOD_REPORT', historical_events_summary: '2022 Historic Silchar Flood: Breach of Bethukandi dyke inundated Silchar town.', vulnerable_routes: 'Bethukandi dyke roads' },
  { id: 'kamrup_metropolitan', name: 'Kamrup Metropolitan', state: 'Assam', primary_hazard: 'Flood', latitude: 26.1445, longitude: 91.7362, source_key: 'ASDMA_DDMP', historical_events_summary: '2024 Guwahati Urban Flood: Intense rainfall of 80mm in 2 hours.', vulnerable_routes: 'G.S. Road underpasses, Anil Nagar evacuation paths' },
  { id: 'barpeta', name: 'Barpeta', state: 'Assam', primary_hazard: 'Flood', latitude: 26.3262, longitude: 91.0080, source_key: 'ASDMA_FLOOD_ATLAS', historical_events_summary: '2024 Riverine Inundation: Embankment overflow of Beki river.', vulnerable_routes: 'Beki river embankment corridors' },
  { id: 'dibrugarh', name: 'Dibrugarh', state: 'Assam', primary_hazard: 'Flood', latitude: 27.4728, longitude: 94.9120, source_key: 'ASDMA_FLOOD_ATLAS', historical_events_summary: '2023 Brahmaputra Monsoon Flood: River water levels exceeded danger marks at Rohmoria.', vulnerable_routes: 'Rohmoria flood protection dyke' },
  { id: 'lakhimpur', name: 'Lakhimpur', state: 'Assam', primary_hazard: 'Flood', latitude: 27.2347, longitude: 94.1032, source_key: 'ASDMA_FLOOD_ATLAS', historical_events_summary: '2024 Subansiri River High Discharge: Inundated over 60 crop lands.', vulnerable_routes: 'Subansiri river basin bridges' },
  { id: 'wayanad', name: 'Wayanad', state: 'Kerala', primary_hazard: 'Landslide', latitude: 11.6854, longitude: 76.1320, source_key: 'GSI_BHUSANKET', historical_events_summary: '2024 Chooralmala Landslide Debris Flow: Devastated Chooralmala and Mundakkai hills.', vulnerable_routes: 'Meppadi-Chooralmala road sections' },
  { id: 'chamoli', name: 'Chamoli', state: 'Uttarakhand', primary_hazard: 'Landslide', latitude: 30.2937, longitude: 79.5603, source_key: 'GSI_BHUSANKET', historical_events_summary: '2021 Glacial Lake Outburst Flood (GLOF): Devastated Rishi Ganga hydropower sites.', vulnerable_routes: 'Joshimath transit highway sections' },
  { id: 'bhuj', name: 'Bhuj', state: 'Gujarat', primary_hazard: 'Earthquake', latitude: 23.2500, longitude: 69.6667, source_key: 'BMTPC_VULNERABILITY_ATLAS', historical_events_summary: '2001 Bhuj Earthquake: Magnitude 7.7 seismic collapse of urban masonry.', vulnerable_routes: 'Dense urban brick masonry roads' },
  { id: 'cuddalore', name: 'Cuddalore', state: 'Tamil Nadu', primary_hazard: 'Cyclone', latitude: 11.7480, longitude: 79.7714, source_key: 'IMD_FORECAST', historical_events_summary: '2020 Cyclone Nivar: High storm surges flooded Gadilam and Pennayar basins.', vulnerable_routes: 'Coastal highway low-lying stretches' },
  { id: 'kendrapara', name: 'Kendrapara', state: 'Odisha', primary_hazard: 'Cyclone', latitude: 20.5050, longitude: 86.4250, source_key: 'IMD_FORECAST', historical_events_summary: '2019 Cyclone Fani: Catastrophic wind speeds and storm breaches.', vulnerable_routes: 'Bhitarkanika tidal zone roads' },
  { id: 'bokaro', name: 'Bokaro', state: 'Jharkhand', primary_hazard: 'Flood', latitude: 23.6693, longitude: 86.1511, source_key: 'ASDMA_FLOOD_REPORT', historical_events_summary: '2023 Damodar Basin Flash Flood: Tenughat Dam discharge forced warning levels.', vulnerable_routes: 'Tenughat dam spillway paths' }
];

const initialShelters = [
  { id: 'sh_1', name: 'Dhemaji Town College Shelter', district: 'Dhemaji', state: 'Assam', shelter_type: 'Multi-Purpose Disaster Shelter', capacity: 500, latitude: 27.4847, longitude: 94.5774, source: 'ASDMA' },
  { id: 'sh_2', name: 'Gogamukh High School Relief Camp', district: 'Dhemaji', state: 'Assam', shelter_type: 'Community Hall used as Shelter', capacity: 350, latitude: 27.3800, longitude: 94.3800, source: 'ASDMA' },
  { id: 'sh_3', name: 'Silapathar Platforms', district: 'Dhemaji', state: 'Assam', shelter_type: 'Raised Platform', capacity: 200, latitude: 27.6000, longitude: 94.7300, source: 'ASDMA' },
  { id: 'sh_4', name: 'Kamrup Metro Stadium Shelter', district: 'Kamrup Metropolitan', state: 'Assam', shelter_type: 'Multi-Purpose Disaster Shelter', capacity: 1200, latitude: 26.1445, longitude: 91.7362, source: 'ASDMA' },
  { id: 'sh_5', name: 'Cachar Public High School Camp', district: 'Cachar', state: 'Assam', shelter_type: 'Relief Camp / Temporary Shelter', capacity: 400, latitude: 24.8333, longitude: 92.7789, source: 'ASDMA' },
  { id: 'sh_6', name: 'Silchar Raised Platform', district: 'Cachar', state: 'Assam', shelter_type: 'Raised Platform', capacity: 150, latitude: 24.8100, longitude: 92.7600, source: 'ASDMA' },
  { id: 'sh_7', name: 'Dibrugarh College Hall Shelter', district: 'Dibrugarh', state: 'Assam', shelter_type: 'Community Hall used as Shelter', capacity: 600, latitude: 27.4728, longitude: 94.9120, source: 'ASDMA' },
  { id: 'sh_8', name: 'Lakhimpur Town Shelter', district: 'Lakhimpur', state: 'Assam', shelter_type: 'Flood Shelter', capacity: 800, latitude: 27.2347, longitude: 94.1032, source: 'ASDMA' }
];

const initialIncidents = [
  { id: 'inc_1', name: '2024 Chooralmala Landslide Debris Flow', disaster_type: 'Landslide', state: 'Kerala', district: 'Wayanad', incident_year: 2024, impact_summary: '320mm rain in 24 hours triggered massive slope failure. Over 300 fatalities.', damage_information: 'Hundreds of residences buried under deep rock boulders.', infrastructure_impact: 'Meppadi-Chooralmala Bailey bridge destroyed.', response_actions: 'Army Engineering constructed 190ft Bailey bridge.', source_name: 'GSI Report 2024', source_url: 'https://gsi.gov.in', verification_status: 'verified' },
  { id: 'inc_2', name: '2022 Historic Silchar Flood', disaster_type: 'Flood', state: 'Assam', district: 'Cachar', incident_year: 2022, impact_summary: 'Breach of Bethukandi dyke inundated 90% of Silchar town for 11 days.', damage_information: 'Over 2.8 lakh residents marooned without drinking water.', infrastructure_impact: 'Electricity sub-stations and civil hospitals submerged.', response_actions: 'IAF airdropped food; NDRF motorized rescue squads deployed.', source_name: 'ASDMA Daily Situation Report 2022', source_url: 'https://asdma.assam.gov.in', verification_status: 'verified' },
  { id: 'inc_3', name: '2021 Rishi Ganga Glacial Outburst (GLOF)', disaster_type: 'Landslide', state: 'Uttarakhand', district: 'Chamoli', incident_year: 2021, impact_summary: 'Glacial rock-ice avalanche triggered devastating flash flood in Dhauli Ganga.', damage_information: 'Over 200 workers trapped in Tapovan hydel tunnel.', infrastructure_impact: 'Rishi Ganga hydel project washed away; barrage breached.', response_actions: 'ITBP and SDRF deployed thermal drones and excavators.', source_name: 'NDMA Assessment Report 2021', source_url: 'https://ndma.gov.in', verification_status: 'verified' },
  { id: 'inc_4', name: '2001 Gujarat Earthquake', disaster_type: 'Earthquake', state: 'Gujarat', district: 'Bhuj', incident_year: 2001, impact_summary: 'Magnitude 7.7 earthquake centered 20km from Bhuj. 20,000 casualties.', damage_information: '300,000 masonry homes destroyed.', infrastructure_impact: 'Bhuj Civil Hospital collapsed; municipal water mains broken.', response_actions: 'National and international search & rescue teams deployed.', source_name: 'BMTPC Vulnerability Atlas of India', source_url: 'https://bmtpc.org', verification_status: 'verified' }
];

const initialAlerts = [
  {
    id: 'alt_1',
    cap_identifier: 'IN-AS-CWC-2026-0042',
    headline: '🔴 CWC RED BULLETIN: Brahmaputra River Surging 1.25m Above Danger Level at Dibrugarh & Nimatighat',
    event: 'Extreme Flash Flood & River Overflow',
    severity: 'Red',
    urgency: 'Immediate',
    certainty: 'Observed',
    effective: new Date().toISOString(),
    expires: new Date(Date.now() + 86400000).toISOString(),
    district_id: 'dibrugarh',
    district_name: 'Dibrugarh',
    state: 'Assam',
    area_description: 'Rohmoria, Bogibeel flood dyke sectors and lower alluvial blocks',
    instruction: 'Evacuate all households within 500m of unreinforced dykes to designated ASDMA multi-purpose shelters immediately.',
    source_agency: 'Central Water Commission (CWC)',
    bulletin_url: 'http://cwc.gov.in/flood-forecast',
    verified: true
  },
  {
    id: 'alt_2',
    cap_identifier: 'IN-AS-IMD-2026-0118',
    headline: '🟧 IMD ORANGE ALERT: Torrential Monsoon Run-off (140–210mm) Forecast Across Northern Catchments',
    event: 'Heavy Precipitation Run-off',
    severity: 'Orange',
    urgency: 'Expected',
    certainty: 'Likely',
    effective: new Date().toISOString(),
    expires: new Date(Date.now() + 172800000).toISOString(),
    district_id: 'dhemaji',
    district_name: 'Dhemaji',
    state: 'Assam',
    area_description: 'Jiadhal, Gai, and Subansiri river catchments',
    instruction: 'Pre-position SDRF inflatable boats at Gogamukh and Silapathar staging depots. Farmers avoid river islands (chars).',
    source_agency: 'India Meteorological Department (IMD)',
    bulletin_url: 'https://mausam.imd.gov.in',
    verified: true
  },
  {
    id: 'alt_3',
    cap_identifier: 'IN-KL-GSI-2026-0089',
    headline: '🟧 GSI LANDSLIDE WATCH: Moisture Saturation Ratio Exceeds 85% on Chooralmala-Mundakkai Slope',
    event: 'Debris Flow & Slope Failure Risk',
    severity: 'Orange',
    urgency: 'Expected',
    certainty: 'Likely',
    effective: new Date().toISOString(),
    expires: new Date(Date.now() + 86400000).toISOString(),
    district_id: 'wayanad',
    district_name: 'Wayanad',
    state: 'Kerala',
    area_description: 'Vellarimala, Chooralmala, Meppadi hill terrain',
    instruction: 'Night travel on Meppadi-Chooralmala highway restricted. Relief camp sirens placed on 15-minute telemetry standby.',
    source_agency: 'Geological Survey of India (GSI)',
    bulletin_url: 'https://gsi.gov.in/bhusanket',
    verified: true
  },
  {
    id: 'alt_4',
    cap_identifier: 'IN-AS-ASDMA-2026-0005',
    headline: '🟡 ASDMA ADVISORY: Bethukandi Embankment Sluice Gate Inspections Underway in Cachar',
    event: 'Embankment Seepage Watch',
    severity: 'Yellow',
    urgency: 'Future',
    certainty: 'Possible',
    effective: new Date().toISOString(),
    expires: new Date(Date.now() + 259200000).toISOString(),
    district_id: 'cachar',
    district_name: 'Cachar',
    state: 'Assam',
    area_description: 'Silchar Municipal Area, Sonai and Katigorah blocks',
    instruction: 'Water resource department patrol squads deployed for 24x7 dyke piping surveillance. Report sand boiling to 1077.',
    source_agency: 'Assam State Disaster Management Authority (ASDMA)',
    bulletin_url: 'https://asdma.assam.gov.in',
    verified: true
  }
];

const initialDisasterMemory = [
  {
    id: 'mem_1',
    incident_id: 'inc_2',
    event_name: '2022 Historic Silchar Flood Catastrophe',
    disaster_type: 'Flood',
    incident_year: 2022,
    state: 'Assam',
    district: 'Cachar',
    failure_modes: [
      'Unrepaired breach in Bethukandi dyke allowed Barak floodwaters to inundate town from rear',
      'Civil Hospital and emergency sub-stations built at zero elevation without raised plinths',
      'VHF wireless towers flooded at ground level cutting district telemetry communication'
    ],
    lessons_learned: [
      'Permanent ring-bunds required around district headquarters instead of temporary earthen plugs',
      'Hospital generators and medical store facilities must be elevated minimum 2.5m above HFL',
      'Auxiliary satellite phones must be pre-positioned at block development offices'
    ],
    actionable_protocols: [
      'Pre-monsoon geo-synthetic grouting of all Barak river sluice gates by April 30',
      'Pre-position 12 High-Capacity Dewatering Pumps (150 HP) at Rangirkhari junction',
      'Establish 3 forward airdrop drop-zones in higher elevation tea garden plateaus'
    ],
    source_report: 'ASDMA Comprehensive Post-Disaster Needs Assessment (PDNA) 2022',
    source_url: 'https://asdma.assam.gov.in/portals/pdna-2022'
  },
  {
    id: 'mem_2',
    incident_id: 'inc_1',
    event_name: '2024 Chooralmala-Mundakkai Landslide Debris Avalanche',
    disaster_type: 'Landslide',
    incident_year: 2024,
    state: 'Kerala',
    district: 'Wayanad',
    failure_modes: [
      'Rapid pore-water pressure accumulation in saturated tea estate slopes without real-time tiltmeters',
      'Single access Bailey bridge washed away isolating entire Mundakkai community',
      'Evacuation shelters were located inside the run-out debris fan zone'
    ],
    lessons_learned: [
      'Shelters must never be established inside narrow V-shaped valley floors',
      'Dual redundant aerial ropeways and modular Bailey bridge components must be cached on high ground',
      'Threshold of 200mm rainfall in 24 hours must trigger mandatory daylight evacuation'
    ],
    actionable_protocols: [
      'Install IoT slope-stability piezometers linked to solar sirens',
      'Relocate community shelters to bedrock ridge top locations above 1100m elevation',
      'Conduct bi-monthly community mock drills across high slope habitations'
    ],
    source_report: 'GSI Landslide Debris Flow Forensic Assessment 2024',
    source_url: 'https://gsi.gov.in/reports/wayanad-2024'
  },
  {
    id: 'mem_3',
    incident_id: 'inc_3',
    event_name: '2021 Rishi Ganga Glacial Outburst Flood (GLOF)',
    disaster_type: 'Landslide / Flash Flood',
    incident_year: 2021,
    state: 'Uttarakhand',
    district: 'Chamoli',
    failure_modes: [
      'Hanging glacier rock-mass detached at 5600m with zero upstream sensor telemetry',
      'Hydroelectric barrage lacked automated emergency sluice release protocols',
      'Workers in lower tunnels had no sirens or audible alarm systems'
    ],
    lessons_learned: [
      'High-altitude GLOF early warning sirens with satellite uplink are non-negotiable',
      'Hydel projects must have dedicated escape galleries and thermal drone rescue kits'
    ],
    actionable_protocols: [
      'Deploy automatic water level gauges at Raunthi and Rishi Ganga confluence',
      'Enforce mandatory wireless beacon bands for all subterranean infrastructure personnel'
    ],
    source_report: 'NDMA High-Altitude GLOF Study 2021',
    source_url: 'https://ndma.gov.in/publications/glof-2021'
  },
  {
    id: 'mem_4',
    incident_id: 'inc_4',
    event_name: '2001 Bhuj Earthquake Disaster',
    disaster_type: 'Earthquake',
    incident_year: 2001,
    state: 'Gujarat',
    district: 'Bhuj',
    failure_modes: [
      'Unreinforced random rubble masonry collapsed instantly under seismic horizontal shear',
      'District hospital collapsed killing medical staff during peak emergency response',
      'Single road corridor to Kutch cut off due to bridge abutment cracks'
    ],
    lessons_learned: [
      'Base-isolation engineering required for all critical emergency facilities in Zone V',
      'Containerized field surgical units must be pre-positioned outside urban collapse cones'
    ],
    actionable_protocols: [
      'Audit seismic retrofitting of all district disaster management offices',
      'Maintain strategic reserve of heavy hydraulic cutters and pneumatic air lifting bags'
    ],
    source_report: 'BMTPC Gujarat Earthquake Vulnerability Report 2001',
    source_url: 'https://bmtpc.org/bhuj-2001'
  }
];

const memoryDb = {
  districts: [...initialDistricts],
  shelters: [...initialShelters],
  historical_incidents: [...initialIncidents],
  alerts: [...initialAlerts],
  disaster_memory: [...initialDisasterMemory],
  scenarios: [],
  risk_assessments: [],
  disaster_reports: [],
  report_analyses: [],
  action_plans: [],
  data_sources: [
    { id: 'asdma_flood_atlas', name: 'Flood Hazard Zonal Atlas 1998–2023', authority: 'ASDMA', hazard: 'Flood', coverage: 'Assam State', data_type: 'GeoJSON / JSON Map Layers', status: 'Connected' },
    { id: 'asdma_flood_reports', name: 'ASDMA Assam Daily Flood Reports', authority: 'ASDMA', hazard: 'Flood', coverage: 'District / Block Level', data_type: 'CSV / JSON Tables', status: 'Connected' },
    { id: 'asdma_fews', name: 'Flood Early Warning System (FEWS)', authority: 'ASDMA', hazard: 'Flood', coverage: 'River Basins', data_type: 'API JSON Feed', status: 'Connected' },
    { id: 'gsi_bhusanket', name: 'GSI Landslide Hazard Susceptibility Zonation', authority: 'GSI Bhusanket', hazard: 'Landslide', coverage: 'Hilly Terrain Grid', data_type: 'GeoJSON / Shapefile', status: 'Connected' },
    { id: 'bmtpc_earthquake', name: 'BMTPC Vulnerability Atlas - Seismic Risk Zones', authority: 'BMTPC', hazard: 'Earthquake', coverage: 'Seismic Zone V / National', data_type: 'GeoJSON / Polygon Layers', status: 'Connected' },
    { id: 'imd_warnings', name: 'IMD Extreme Weather Alerts', authority: 'IMD', hazard: 'Multi-Hazard', coverage: 'National / State Subdivisions', data_type: 'JSON Alerts Feed', status: 'Connected' },
    { id: 'official_shelters', name: 'Emergency Shelters Database', authority: 'ASDMA', hazard: 'Multi-Hazard', coverage: 'State / District Level', data_type: 'CSV / JSON / GeoJSON', status: 'Connected' }
  ]
};

export const SupabaseService = {
  // DISTRICTS
  getDistricts: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('districts').select('*').order('name');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        logger.error('Supabase getDistricts error:', { error: e.message });
      }
    }
    return memoryDb.districts;
  },

  getDistrictById: async (id) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('districts').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase getDistrictById error:', { error: e.message });
      }
    }
    return memoryDb.districts.find(d => d.id === id) || null;
  },

  // SHELTERS
  getShelters: async (districtName = null) => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('shelters').select('*');
        if (districtName) {
          query = query.ilike('district', `%${districtName}%`);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase getShelters error:', { error: e.message });
      }
    }

    if (districtName) {
      return memoryDb.shelters.filter(s => s.district.toLowerCase() === districtName.toLowerCase());
    }
    return memoryDb.shelters;
  },

  createSheltersBatch: async (sheltersList) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('shelters').insert(sheltersList);
        if (!error) return data;
      } catch (e) {
        logger.error('Supabase createSheltersBatch error:', { error: e.message });
      }
    }
    sheltersList.forEach(s => {
      memoryDb.shelters.push({ ...s, id: s.id || uuidv4() });
    });
    return sheltersList;
  },

  // HISTORICAL INCIDENTS
  getHistoricalIncidents: async ({ district, disasterType } = {}) => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('historical_incidents').select('*').order('incident_year', { ascending: false });
        if (district) query = query.ilike('district', `%${district}%`);
        if (disasterType) query = query.ilike('disaster_type', `%${disasterType}%`);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase getHistoricalIncidents error:', { error: e.message });
      }
    }

    return memoryDb.historical_incidents.filter(inc => {
      if (district && !inc.district.toLowerCase().includes(district.toLowerCase())) return false;
      if (disasterType && !inc.disaster_type.toLowerCase().includes(disasterType.toLowerCase())) return false;
      return true;
    });
  },

  createHistoricalIncident: async (incidentData) => {
    const record = {
      id: uuidv4(),
      ...incidentData,
      verification_status: incidentData.verification_status || 'verified',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('historical_incidents').insert([record]).select().single();
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase createHistoricalIncident error:', { error: e.message });
      }
    }

    memoryDb.historical_incidents.unshift(record);
    return record;
  },

  // DISASTER REPORTS & ANALYSES
  createDisasterReport: async (reportData) => {
    const record = {
      id: uuidv4(),
      ...reportData,
      status: reportData.status || 'uploaded',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('disaster_reports').insert([record]).select().single();
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase createDisasterReport error:', { error: e.message });
      }
    }

    memoryDb.disaster_reports.unshift(record);
    return record;
  },

  updateDisasterReportStatus: async (reportId, status, errorMsg = null) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('disaster_reports')
          .update({ status, error_message: errorMsg, updated_at: new Date().toISOString() })
          .eq('id', reportId);
      } catch (e) {
        logger.error('Supabase updateDisasterReportStatus error:', { error: e.message });
      }
    }

    const found = memoryDb.disaster_reports.find(r => r.id === reportId);
    if (found) {
      found.status = status;
      found.error_message = errorMsg;
    }
  },

  saveReportAnalysis: async (analysisData) => {
    const record = {
      id: uuidv4(),
      ...analysisData,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('report_analyses').insert([record]).select().single();
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase saveReportAnalysis error:', { error: e.message });
      }
    }

    memoryDb.report_analyses.unshift(record);
    return record;
  },

  getReportAnalyses: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('report_analyses').select('*, disaster_reports(*)').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase getReportAnalyses error:', { error: e.message });
      }
    }
    return memoryDb.report_analyses;
  },

  // ALERTS (Live CAP-Compliant Alert Center)
  getAlerts: async (districtId = null) => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('alerts').select('*').order('created_at', { ascending: false });
        if (districtId) {
          query = query.or(`district_id.eq.${districtId},district_id.is.null`);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase getAlerts error:', { error: e.message });
      }
    }

    if (districtId) {
      return memoryDb.alerts.filter(a => !a.district_id || a.district_id.toLowerCase() === districtId.toLowerCase());
    }
    return memoryDb.alerts;
  },

  broadcastAlert: async (alertData) => {
    const record = {
      id: uuidv4(),
      cap_identifier: `IN-ALERT-${Date.now()}`,
      created_at: new Date().toISOString(),
      verified: true,
      ...alertData
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('alerts').insert([record]).select().single();
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase broadcastAlert error:', { error: e.message });
      }
    }

    memoryDb.alerts.unshift(record);
    return record;
  },

  // DISASTER MEMORY ENGINE
  getDisasterMemory: async (districtOrKeyword = null) => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('disaster_memory').select('*');
        if (districtOrKeyword) {
          query = query.or(`district.ilike.%${districtOrKeyword}%,event_name.ilike.%${districtOrKeyword}%`);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase getDisasterMemory error:', { error: e.message });
      }
    }

    if (districtOrKeyword) {
      const q = districtOrKeyword.toLowerCase();
      return memoryDb.disaster_memory.filter(m => 
        m.district.toLowerCase().includes(q) || 
        m.event_name.toLowerCase().includes(q) ||
        m.disaster_type.toLowerCase().includes(q)
      );
    }
    return memoryDb.disaster_memory;
  },

  // SCENARIOS (What-If Simulator)
  saveScenario: async (scenarioData) => {
    const record = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      ...scenarioData
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('scenarios').insert([record]).select().single();
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase saveScenario error:', { error: e.message });
      }
    }

    memoryDb.scenarios.unshift(record);
    return record;
  },

  getScenarios: async (districtId = null) => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('scenarios').select('*').order('created_at', { ascending: false });
        if (districtId) {
          query = query.eq('district_id', districtId);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase getScenarios error:', { error: e.message });
      }
    }

    if (districtId) {
      return memoryDb.scenarios.filter(s => s.districtId === districtId || s.district_id === districtId);
    }
    return memoryDb.scenarios;
  },

  // RISK ASSESSMENTS (AI Disaster Risk Intelligence)
  saveRiskAssessment: async (assessmentData) => {
    const record = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      ...assessmentData
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('risk_assessments').insert([record]).select().single();
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase saveRiskAssessment error:', { error: e.message });
      }
    }

    memoryDb.risk_assessments.unshift(record);
    return record;
  },

  getRiskAssessments: async (districtId = null) => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('risk_assessments').select('*').order('created_at', { ascending: false });
        if (districtId) {
          query = query.eq('district_id', districtId);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        logger.error('Supabase getRiskAssessments error:', { error: e.message });
      }
    }

    if (districtId) {
      return memoryDb.risk_assessments.filter(r => r.districtId === districtId || r.district_id === districtId);
    }
    return memoryDb.risk_assessments;
  },

  // DATA SOURCES
  getDataSources: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('data_sources').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        logger.error('Supabase getDataSources error:', { error: e.message });
      }
    }
    return memoryDb.data_sources;
  },

  // STATS
  getSystemStats: async () => {
    const totalDistricts = memoryDb.districts.length;
    const totalShelters = memoryDb.shelters.length;
    const totalIncidents = memoryDb.historical_incidents.length;
    const totalReports = memoryDb.disaster_reports.length;
    const analyzedReports = memoryDb.report_analyses.length;

    return {
      totalDistricts,
      totalShelters,
      totalIncidents,
      totalReports,
      analyzedReports,
      dataSourcesCount: memoryDb.data_sources.length
    };
  }
};
