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
  { id: 'bhuj', name: 'Bhuj', state: 'Gujarat', primary_hazard: 'Earthquake', latitude: 23.2500, 69.6667, source_key: 'BMTPC_VULNERABILITY_ATLAS', historical_events_summary: '2001 Bhuj Earthquake: Magnitude 7.7 seismic collapse of urban masonry.', vulnerable_routes: 'Dense urban brick masonry roads' },
  { id: 'cuddalore', name: 'Cuddalore', state: 'Tamil Nadu', primary_hazard: 'Cyclone', latitude: 11.7480, 79.7714, source_key: 'IMD_FORECAST', historical_events_summary: '2020 Cyclone Nivar: High storm surges flooded Gadilam and Pennayar basins.', vulnerable_routes: 'Coastal highway low-lying stretches' },
  { id: 'kendrapara', name: 'Kendrapara', state: 'Odisha', primary_hazard: 'Cyclone', latitude: 20.5050, 86.4250, source_key: 'IMD_FORECAST', historical_events_summary: '2019 Cyclone Fani: Catastrophic wind speeds and storm breaches.', vulnerable_routes: 'Bhitarkanika tidal zone roads' },
  { id: 'bokaro', name: 'Bokaro', state: 'Jharkhand', primary_hazard: 'Flood', latitude: 23.6693, 86.1511, source_key: 'ASDMA_FLOOD_REPORT', historical_events_summary: '2023 Damodar Basin Flash Flood: Tenughat Dam discharge forced warning levels.', vulnerable_routes: 'Tenughat dam spillway paths' }
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

const memoryDb = {
  districts: [...initialDistricts],
  shelters: [...initialShelters],
  historical_incidents: [...initialIncidents],
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
