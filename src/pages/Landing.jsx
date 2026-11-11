import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { BookOpen, AlertTriangle, ShieldCheck, ArrowRight, Activity, Zap, Layers, ChevronRight, Droplets, Wind, Mountain, Sun, Globe, ShieldAlert, Landmark, Compass } from 'lucide-react';
import { statisticsSummary, districts } from '../data/mockData';
import { getIngestedDataset } from '../dataSources/dataIngestion';
import { api } from '../services/api';

// Complete coordinate parameters config for all 36 Indian States and UTs
const stateMapConfig = {
  "Andhra Pradesh": { center: [15.9129, 79.7400], zoom: 7 },
  "Arunachal Pradesh": { center: [28.2180, 94.7278], zoom: 7 },
  "Assam": { center: [26.2006, 92.9376], zoom: 7 },
  "Bihar": { center: [25.0961, 85.3131], zoom: 7 },
  "Chhattisgarh": { center: [21.2787, 81.8661], zoom: 7 },
  "Goa": { center: [15.2993, 74.1240], zoom: 9 },
  "Gujarat": { center: [22.2587, 71.1924], zoom: 7 },
  "Haryana": { center: [29.0588, 76.0856], zoom: 7 },
  "Himachal Pradesh": { center: [31.1048, 77.1734], zoom: 7 },
  "Jharkhand": { center: [23.6102, 85.2799], zoom: 7 },
  "Karnataka": { center: [15.3173, 75.7139], zoom: 7 },
  "Kerala": { center: [10.8505, 76.2711], zoom: 7 },
  "Madhya Pradesh": { center: [22.9734, 78.6569], zoom: 7 },
  "Maharashtra": { center: [19.7515, 75.7139], zoom: 7 },
  "Manipur": { center: [24.6637, 93.9063], zoom: 8 },
  "Meghalaya": { center: [25.4670, 91.3662], zoom: 8 },
  "Mizoram": { center: [23.1645, 92.9376], zoom: 8 },
  "Nagaland": { center: [26.1584, 94.5624], zoom: 8 },
  "Odisha": { center: [20.9517, 85.0985], zoom: 7 },
  "Punjab": { center: [31.1471, 75.3412], zoom: 7 },
  "Rajasthan": { center: [27.0238, 74.2179], zoom: 6 },
  "Sikkim": { center: [27.5330, 88.5122], zoom: 9 },
  "Tamil Nadu": { center: [11.1271, 78.6569], zoom: 7 },
  "Telangana": { center: [18.1124, 79.0193], zoom: 7 },
  "Tripura": { center: [23.9408, 91.9882], zoom: 9 },
  "Uttar Pradesh": { center: [26.8467, 80.9462], zoom: 7 },
  "Uttarakhand": { center: [30.0668, 79.0193], zoom: 7 },
  "West Bengal": { center: [22.9868, 87.8550], zoom: 7 },
  "Andaman and Nicobar Islands": { center: [11.7401, 92.6586], zoom: 7 },
  "Chandigarh": { center: [30.7333, 76.7794], zoom: 11 },
  "Dadra and Nagar Haveli and Daman and Diu": { center: [20.1809, 73.0169], zoom: 9 },
  "Delhi": { center: [28.7041, 77.1025], zoom: 9 },
  "Jammu and Kashmir": { center: [33.7780, 76.5762], zoom: 7 },
  "Ladakh": { center: [34.1526, 77.5771], zoom: 7 },
  "Lakshadweep": { center: [10.5667, 72.6417], zoom: 8 },
  "Puducherry": { center: [11.9416, 79.8083], zoom: 9 }
};

// District mapping datasets
const stateDistrictsCoords = {
  "Assam": [
    { name: "Baksa", coords: [26.6935, 91.4221] },
    { name: "Barpeta", coords: [26.3262, 91.0080] },
    { name: "Biswanath", coords: [26.7324, 93.1554] },
    { name: "Bongaigaon", coords: [26.4712, 90.5581] },
    { name: "Cachar", coords: [24.8333, 92.7789] },
    { name: "Charaideo", coords: [26.9037, 94.8872] },
    { name: "Chirang", coords: [26.5412, 90.4854] },
    { name: "Darrang", coords: [26.4524, 92.0254] },
    { name: "Dhemaji", coords: [27.4847, 94.5774] },
    { name: "Dhubri", coords: [26.0206, 89.9754] },
    { name: "Dibrugarh", coords: [27.4728, 94.9120] },
    { name: "Dima Hasao", coords: [25.1843, 92.9376] },
    { name: "Goalpara", coords: [26.1118, 90.6278] },
    { name: "Golaghat", coords: [26.5204, 93.9654] },
    { name: "Hailakandi", coords: [24.6833, 92.5667] },
    { name: "Hojai", coords: [26.0022, 92.8554] },
    { name: "Jorhat", coords: [26.7509, 94.2037] },
    { name: "Kamrup", coords: [26.3124, 91.4554] },
    { name: "Kamrup Metropolitan", coords: [26.1445, 91.7362] },
    { name: "Karbi Anglong", coords: [26.0022, 93.5022] },
    { name: "Kokrajhar", coords: [26.4015, 90.2662] },
    { name: "Lakhimpur", coords: [27.2347, 94.1032] },
    { name: "Majuli", coords: [26.9606, 94.1878] },
    { name: "Morigaon", coords: [26.2583, 92.2662] },
    { name: "Nagaon", coords: [26.3478, 92.6841] },
    { name: "Nalbari", coords: [26.4441, 91.4322] },
    { name: "Sivasagar", coords: [26.9837, 94.6322] },
    { name: "Sonitpur", coords: [26.6338, 92.7989] },
    { name: "South Salmara", coords: [25.8206, 89.9554] },
    { name: "Tinsukia", coords: [27.5002, 95.3662] },
    { name: "Udalguri", coords: [26.7445, 92.0954] },
    { name: "West Karbi Anglong", coords: [25.8022, 92.5554] }
  ],
  "Jharkhand": [
    { name: "Bokaro", coords: [23.6738, 86.1554] },
    { name: "Dhanbad", coords: [23.7957, 86.4304] },
    { name: "Ranchi", coords: [23.3441, 85.3096] },
    { name: "Hazaribagh", coords: [23.9934, 85.3622] },
    { name: "Giridih", coords: [24.1906, 86.3022] },
    { name: "Deoghar", coords: [24.4854, 86.7022] },
    { name: "East Singhbhum", coords: [22.6102, 86.2022] },
    { name: "West Singhbhum", coords: [22.4502, 85.6022] }
  ],
  "Kerala": [
    { name: "Wayanad", coords: [11.6854, 76.1320] },
    { name: "Trivandrum", coords: [8.5241, 76.9366] },
    { name: "Ernakulam", coords: [9.9816, 76.2998] },
    { name: "Kozhikode", coords: [11.2588, 75.7804] }
  ],
  "Uttarakhand": [
    { name: "Chamoli", coords: [30.4078, 79.3289] },
    { name: "Dehradun", coords: [30.3165, 78.0322] },
    { name: "Haridwar", coords: [29.9457, 78.1642] },
    { name: "Nainital", coords: [29.3803, 79.4636] }
  ],
  "Tamil Nadu": [
    { name: "Cuddalore", coords: [11.7480, 79.7714] },
    { name: "Chennai", coords: [13.0827, 80.2707] },
    { name: "Coimbatore", coords: [11.0168, 76.9558] }
  ],
  "Odisha": [
    { name: "Kendrapara", coords: [20.4936, 86.4258] },
    { name: "Bhubaneswar", coords: [20.2961, 85.8245] },
    { name: "Cuttack", coords: [20.4625, 85.8830] }
  ],
  "Gujarat": [
    { name: "Bhuj", coords: [23.2420, 69.6670] },
    { name: "Ahmedabad", coords: [23.0225, 72.5714] },
    { name: "Surat", coords: [21.1702, 72.8311] }
  ]
};

// Retrieve districts for selected state, falling back dynamically for other regions
const getDistrictsForState = (state) => {
  if (stateDistrictsCoords[state]) {
    return stateDistrictsCoords[state];
  }
  const config = stateMapConfig[state] || stateMapConfig["Assam"];
  return [
    { name: `${state} Northern District`, coords: [config.center[0] + 0.3, config.center[1]] },
    { name: `${state} Southern District`, coords: [config.center[0] - 0.3, config.center[1]] },
    { name: `${state} Capital Region`, coords: [config.center[0], config.center[1]] }
  ];
};

// Helper to construct custom HTML markers based on hazard risk and layer types
const createCustomIcon = (color, type) => {
  let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5" class="h-4 w-4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;
  const colors = {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    blue: '#2563eb',
    teal: '#0d9488',
    amber: '#d97706',
    slate: '#94a3b8'
  };
  const targetColor = colors[color] || color;

  return L.divIcon({
    html: `<div style="
      background-color: ${targetColor};
      color: white;
      border: 2px solid white;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
    ">
      ${iconSvg}
    </div>`,
    className: 'custom-map-icon',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

// Map size invalidation and center alignment sub-component
function MapRefresher({ mapCenter, mapZoom, activeDistrict }) {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (mapCenter) {
      map.setView(mapCenter, mapZoom, { animate: true });
    }
    map.invalidateSize();
  }, [mapCenter, mapZoom, map]);

  useEffect(() => {
    map.invalidateSize();
  }, [activeDistrict]);

  return null;
}

export default function Landing({ 
  setActivePage, 
  setSelectedDistrictId, 
  selectedDisasterType = "Flood", 
  setSelectedDisasterType 
}) {
  const [selectedState, setSelectedState] = useState("Assam");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [mapCenter, setMapCenter] = useState([26.2006, 92.9376]);
  const [mapZoom, setMapZoom] = useState(7);

  // Ingested layer references
  const [ingestedLayers, setIngestedLayers] = useState({
    asdma_flood_atlas: null,
    gsi_bhusanket: null,
    bmtpc_earthquake: null,
    imd_warnings: null
  });

  // Layer switches states
  const [layers, setLayers] = useState({
    floodRisk: true,
    cycloneExposure: false,
    landslideRisk: false,
    earthquakeRisk: false,
    heatwaveRisk: false,
    multiHazard: false
  });

  useEffect(() => {
    setIngestedLayers({
      asdma_flood_atlas: getIngestedDataset('asdma_flood_atlas'),
      gsi_bhusanket: getIngestedDataset('gsi_bhusanket'),
      bmtpc_earthquake: getIngestedDataset('bmtpc_earthquake'),
      imd_warnings: getIngestedDataset('imd_warnings')
    });
  }, []);

  const handleLayerToggle = (layerId) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const handleFeatureClick = (districtId, hazard) => {
    setSelectedDistrictId(districtId);
    if (hazard && setSelectedDisasterType) {
      setSelectedDisasterType(hazard);
    }
    setActivePage('map');
  };

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedDistrict("all");
    
    // Zoom map to state center
    const config = stateMapConfig[stateName] || stateMapConfig["Assam"];
    setMapCenter(config.center);
    setMapZoom(config.zoom);

    // Sync first district of selected state to global state
    const firstDist = districts.find(d => d.state === stateName);
    if (firstDist && setSelectedDistrictId) {
      setSelectedDistrictId(firstDist.id);
    }
  };

  const handleDistrictChange = (districtVal) => {
    setSelectedDistrict(districtVal);
    if (districtVal === "all") {
      const config = stateMapConfig[selectedState] || stateMapConfig["Assam"];
      setMapCenter(config.center);
      setMapZoom(config.zoom);
      return;
    }
    
    const activeList = getDistrictsForState(selectedState);
    const match = activeList.find(d => d.name === districtVal);
    if (match) {
      setMapCenter(match.coords);
      setMapZoom(10);
      
      // Update global selected district ID if it exists in mockData
      const idMatch = districts.find(d => d.name.toLowerCase() === districtVal.toLowerCase());
      if (idMatch && setSelectedDistrictId) {
        setSelectedDistrictId(idMatch.id);
      }

      // Directly navigate to Disaster Map page
      if (setActivePage) {
        setActivePage('map');
      }
    }
  };

  const datasetChecks = {
    floodRisk: { loaded: !!ingestedLayers.asdma_flood_atlas, label: 'Flood Hazard' },
    cycloneExposure: { loaded: !!ingestedLayers.imd_warnings, label: 'Cyclone Exposure' },
    landslideRisk: { loaded: !!ingestedLayers.gsi_bhusanket, label: 'Landslide Hazard' },
    earthquakeRisk: { loaded: !!ingestedLayers.bmtpc_earthquake, label: 'Earthquake Hazard' },
    heatwaveRisk: { loaded: !!ingestedLayers.imd_warnings, label: 'Heatwave Hazard' }
  };

  const hazardList = [
    { id: 'Flood', label: 'Flood', color: 'text-[#2563EB]', accentColor: 'border-[#2563EB]', icon: <Droplets className="h-5 w-5" /> },
    { id: 'Cyclone', label: 'Cyclone', color: 'text-[#0D9488]', accentColor: 'border-[#0D9488]', icon: <Wind className="h-5 w-5" /> },
    { id: 'Landslide', label: 'Landslide', color: 'text-[#EA580C]', accentColor: 'border-[#EA580C]', icon: <Mountain className="h-5 w-5" /> },
    { id: 'Earthquake', label: 'Earthquake', color: 'text-[#DC2626]', accentColor: 'border-[#DC2626]', icon: <Activity className="h-5 w-5" /> },
    { id: 'Heatwave', label: 'Heatwave', color: 'text-[#F59E0B]', accentColor: 'border-[#F59E0B]', icon: <Sun className="h-5 w-5" /> }
  ];

  return (
    <div className="bg-[#F2F6FA] min-h-screen text-left font-sans">
      
      {/* SECTION 1: White Background Hero Area */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column (40%) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#061A2F] border border-slate-800 text-slate-300 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-green-500 animate-pulse" />
              National Mitigation Node Active
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-[#061A2F] tracking-tight font-display leading-none">
                RESILIENCE AI
              </h1>
              <h2 className="text-lg font-bold text-slate-650 leading-snug">
                Multi-Hazard Disaster Preparedness Intelligence Platform
              </h2>
            </div>
            
            <p className="text-sm text-slate-500 font-semibold leading-relaxed max-w-sm">
              "Past disasters become intelligence for the next emergency."
            </p>
            
            {/* Dropdown selectors for panning map */}
            <div className="bg-[#F2F6FA] border border-slate-200 p-4 rounded-[14px] space-y-3 shadow-inner relative z-50 gis-map-focus">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">GIS Map Focus</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold block uppercase">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full border-slate-300 rounded p-1.5 text-xs font-bold text-[#061A2F] bg-white cursor-pointer focus:border-[#2563EB] focus:ring-[#2563EB]"
                  >
                    {Object.keys(stateMapConfig).sort().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold block uppercase">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full border-slate-350 rounded p-1.5 text-xs font-bold text-[#061A2F] bg-white cursor-pointer focus:border-[#2563EB] focus:ring-[#2563EB]"
                  >
                    <option value="all">Full State</option>
                    {getDistrictsForState(selectedState).map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Map Info area indicator */}
              <div className="pt-1 flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Selected Area:</span>
                <span className="text-[10px] text-[#061A2F] font-bold">
                  {selectedState} {selectedDistrict !== "all" ? `/ ${selectedDistrict}` : ""}
                </span>
              </div>

              {/* Check if state is loaded */}
              {selectedState !== "Assam" && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-[8px] text-[10px] font-bold flex items-start gap-1.5 leading-normal">
                  <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Official hazard dataset not loaded for this State. Show base map only.</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => setActivePage('map')}
                className="w-full sm:w-auto px-5 py-3 bg-[#061A2F] hover:bg-[#0A2540] text-white font-bold rounded shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-xs uppercase tracking-wider"
              >
                Explore Disaster Map
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-[#EA580C]" />
              </button>
              <button
                onClick={() => setActivePage('analyze')}
                className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-350 hover:bg-slate-50 text-[#061A2F] font-bold rounded shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                Analyze District
              </button>
            </div>
          </div>

          {/* Right Column: Actual Assam Leaflet Map (60%) */}
          <div className="lg:col-span-7 h-[400px] min-h-[400px] w-full border border-slate-200 shadow-sm rounded-[14px] overflow-hidden relative z-10 bg-slate-50">
            
            <MapContainer 
              center={[26.2006, 92.9376]} 
              zoom={7} 
              scrollWheelZoom={true}
              style={{ height: '100%', minHeight: '400px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapRefresher mapCenter={mapCenter} mapZoom={mapZoom} activeDistrict={selectedDistrict} />

              {/* 🗺️ RENDER REAL PARSED GEOJSON FILES DIRECTLY IF INGESTED */}
              {layers.floodRisk && ingestedLayers.asdma_flood_atlas && selectedState === "Assam" && (
                <GeoJSON 
                  data={ingestedLayers.asdma_flood_atlas.data} 
                  style={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.25, weight: 1.5 }}
                />
              )}

              {layers.landslideRisk && ingestedLayers.gsi_bhusanket && selectedState === "Assam" && (
                <GeoJSON 
                  data={ingestedLayers.gsi_bhusanket.data} 
                  style={{ color: '#EA580C', fillColor: '#EA580C', fillOpacity: 0.25, weight: 1.5 }}
                />
              )}

              {layers.earthquakeRisk && ingestedLayers.bmtpc_earthquake && selectedState === "Assam" && (
                <GeoJSON 
                  data={ingestedLayers.bmtpc_earthquake.data} 
                  style={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.25, weight: 1.5 }}
                />
              )}

              {/* Dynamic state district markers */}
              {getDistrictsForState(selectedState).map((dist) => {
                const fullDistMatch = districts.find(d => d.name === dist.name && d.state === selectedState);
                const hasGISData = fullDistMatch && fullDistMatch.verifiedIndicators !== null && fullDistMatch.verifiedIndicators !== undefined;
                return (
                  <Marker
                    key={dist.name}
                    position={dist.coords}
                    icon={createCustomIcon(hasGISData ? (fullDistMatch.riskColor || 'blue') : 'slate', 'district')}
                    eventHandlers={{ click: () => handleDistrictChange(dist.name) }}
                  />
                );
              })}
            </MapContainer>

            {/* Floating Map Layers Control Panel */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl p-3 z-[40] w-48 text-[10px]">
              <div className="flex items-center gap-1.5 font-bold text-[#061A2F] border-b border-slate-200 pb-1 mb-2">
                <Layers className="h-3.5 w-3.5" />
                <span>Map Layers</span>
              </div>
              <div className="space-y-1.5 font-semibold">
                {Object.entries(datasetChecks).map(([layerId, config]) => (
                  <div key={layerId} className="space-y-0.5">
                    <label className={`flex items-center gap-1.5 cursor-pointer ${config.loaded && selectedState === "Assam" ? 'text-slate-700' : 'text-slate-400 cursor-not-allowed'}`}>
                      <input
                        type="checkbox"
                        checked={layers[layerId]}
                        disabled={!config.loaded || selectedState !== "Assam"}
                        onChange={() => handleLayerToggle(layerId)}
                        className="rounded border-slate-300 text-navy-800 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                      />
                      <span>{config.label}</span>
                    </label>
                    {(!config.loaded || selectedState !== "Assam") && (
                      <span className="text-[8px] text-red-500 font-extrabold block pl-5 leading-none">
                        Official GIS Layer Not Loaded
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Map Legend Card */}
            <div className="absolute bottom-3 left-3 bg-white/90 border border-slate-200 shadow rounded-xl p-2.5 z-[40] text-[9px] space-y-1.5 max-w-[130px] font-bold">
              <div className="text-navy-900 border-b border-slate-100 pb-0.5 uppercase text-[8px] tracking-wider">
                Legend
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  <span className="text-blue-700">Flood</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
                  <span className="text-teal-700">Cyclone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                  <span className="text-orange-700">Landslide</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <span className="text-red-700">Earthquake</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span className="text-amber-700">Heatwave</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: Alternating Light Background Status Bar */}
      <section className="bg-[#F2F6FA] py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono pl-2 block">
            Multi-Hazard Threat Spectrum:
          </span>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {hazardList.map((hazard) => {
              const isActive = selectedDisasterType === hazard.id;
              return (
                <div
                  key={hazard.id}
                  onClick={() => {
                    if (setSelectedDisasterType) {
                      setSelectedDisasterType(hazard.id);
                    }
                  }}
                  className={`bg-white border rounded-[14px] p-4 shadow-sm hover:shadow transition-all cursor-pointer border-l-4 ${hazard.accentColor} flex flex-col justify-between h-24 ${
                    isActive ? 'ring-2 ring-[#061A2F]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-[#061A2F]">{hazard.label}</span>
                    <span className={hazard.color}>{hazard.icon}</span>
                  </div>
                  <span className="text-[10px] text-[#2563EB] font-bold uppercase hover:underline text-left block">
                    View Data
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: White Background Core Cards */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-[14px] border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-blue-50/50 w-12 h-12 rounded-lg flex items-center justify-center border border-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">1. Evidence Document Extraction</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                Upload District Disaster Management Plans or relief logs. Our AI automatically parses actual records to pinpoint past structural failures.
              </p>
            </div>
            <div className="pt-4 text-xs font-semibold text-[#2563EB] flex items-center gap-1">
              Verify document sources <ChevronRight className="h-3 w-3" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[14px] border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-orange-50/50 w-12 h-12 rounded-lg flex items-center justify-center border border-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">2. Vulnerability Gaps Mapping</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                Cross-references active stock levels (warning stations, boats, medical reserves) against state thresholds. Zero simulation fallback.
              </p>
            </div>
            <div className="pt-4 text-xs font-semibold text-orange-605 flex items-center gap-1">
              Audit regional datasets <ChevronRight className="h-3 w-3" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[14px] border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-green-50/50 w-12 h-12 rounded-lg flex items-center justify-center border border-green-100">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">3. Formulate Action Directives</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                Instantly converts documented failure trends into actionable pre-disaster timelines for local revenue offices and response squads.
              </p>
            </div>
            <div className="pt-4 text-xs font-semibold text-[#16A34A] flex items-center gap-1">
              Export verified policy checklists <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Alternating Light Background Statistical Bar */}
      <section className="bg-[#F2F6FA] py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-navy-900 font-display">
              {statisticsSummary.disastersCataloged}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Disasters Cataloged
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-200">
            <div className="text-3xl font-extrabold text-[#061A2F] font-display">
              {statisticsSummary.districtsMonitored}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Districts Monitored
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-200">
            <div className="text-3xl font-extrabold text-[#061A2F] font-display">
              {statisticsSummary.gapsIdentified}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Mitigation Gaps Found
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-200">
            <div className="text-3xl font-extrabold text-[#061A2F] font-display">
              {statisticsSummary.actionPlansGenerated}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Action Policies Formatted
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: White Background Featured District Lists */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold text-navy-900 font-display">Featured District Hazard Profiles</h2>
            <p className="text-slate-500 text-sm">
              Study verified data records. Clicking a district profile auto-focuses analysis on its mapped incident telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {districts.filter(d => d.verifiedIndicators !== null && d.state === selectedState).slice(0, 6).map((dist) => {
              const hazardKey = selectedDisasterType.toLowerCase();
              const profile = dist.hazardProfiles && dist.hazardProfiles[hazardKey] ? dist.hazardProfiles[hazardKey] : dist;
              
              const isLandslide = selectedDisasterType === "Landslide";
              const isCyclone = selectedDisasterType === "Cyclone";
              const isFlood = selectedDisasterType === "Flood";
              const isEarthquake = selectedDisasterType === "Earthquake";
              const isHeatwave = selectedDisasterType === "Heatwave";

              let badgeColor = "bg-slate-100 text-slate-800 border-slate-200";
              if (isLandslide) badgeColor = "bg-orange-50 text-orange-700 border-orange-200";
              if (isCyclone) badgeColor = "bg-teal-50 text-teal-700 border-teal-200";
              if (isFlood) badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
              if (isEarthquake) badgeColor = "bg-red-50 text-red-700 border-red-200";
              if (isHeatwave) badgeColor = "bg-amber-50 text-amber-700 border-amber-200";

              const hasHazardData = dist.hazardProfiles && dist.hazardProfiles[hazardKey] !== null;

              return (
                <div 
                  key={dist.id} 
                  onClick={() => handleFeatureClick(dist.id, selectedDisasterType)}
                  className="bg-white border border-[#E2E8F0] rounded-[14px] p-6 hover:border-[#061A2F] hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between text-left group animate-fade-in"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {dist.state}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${badgeColor}`}>
                        {selectedDisasterType}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-navy-900 group-hover:text-navy-955 transition-colors">
                      {dist.name} District
                    </h3>
                    
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-semibold">
                      {hasHazardData ? profile.gap : "No official data records mapped for this hazard type in active district directory."}
                    </p>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Preparedness:</span>
                      <span className={`font-bold ${hasHazardData && profile.preparednessScore ? (profile.preparednessScore >= 75 ? 'text-green-600' : 'text-orange-600') : 'text-slate-400'}`}>
                        {hasHazardData && profile.preparednessScore ? `${profile.preparednessScore}%` : 'Data Not Available'}
                      </span>
                    </div>
                    <span className="text-[#2563EB] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Analyze <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
            {districts.filter(d => d.verifiedIndicators !== null && d.state === selectedState).length === 0 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white border border-[#E2E8F0] rounded-[14px] p-8 text-center text-slate-450 space-y-2 shadow-sm font-semibold">
                <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-navy-900 uppercase">No Featured Districts</h4>
                <p className="text-[10px] max-w-sm mx-auto text-slate-500 leading-normal">
                  No official hazard datasets are ingested for {selectedState}. Select "Assam" in the GIS Focus Panel to inspect working profiles.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
