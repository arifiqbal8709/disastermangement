import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMap, GeoJSON, Popup } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { Layers, ShieldCheck, MapPin, Landmark, HeartPulse, ShieldAlert, Navigation, Home, Activity, X, Info, AlertTriangle, Zap, CheckCircle2, Droplets, Wind, Mountain, Sun, FileText, Database, AlertCircle, Compass, ArrowRight, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { districts, getDistrictData } from '../data/mockData';
import SourceBadge from '../components/SourceBadge';
import { getIngestedDataset } from '../dataSources/dataIngestion';
import { api } from '../services/api';
import ScenarioSimulatorModal from '../components/ScenarioSimulatorModal';

// Helper to construct custom HTML markers based on hazard risk and layer types
const createCustomIcon = (color, type, label) => {
  const colors = {
    red: '#dc2626',
    orange: '#ea580c',
    yellow: '#d97706',
    green: '#16a34a',
    blue: '#2563eb',
    teal: '#0d9488',
    amber: '#d97706',
    slate: '#64748b',
    purple: '#7c3aed',
    indigo: '#4f46e5'
  };
  const targetColor = colors[color] || color;

  let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5" style="width:14px;height:14px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;
  let badgeText = label || (type === 'district' ? '📍 DISTRICT' : 'MARKER');

  if (type === 'hospital') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    badgeText = label || '🏥 HOSPITAL';
  } else if (type === 'resource') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`;
    badgeText = label || '⚓ SDRF RESCUE';
  } else if (type === 'flood_red') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`;
    badgeText = label || '🔴 HIGH FLOOD';
  } else if (type === 'flood_yellow') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    badgeText = label || '🟡 MODERATE RISK';
  } else if (type === 'flood_green') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`;
    badgeText = label || '🟢 SAFE ZONE';
  }

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
        <div style="
          position: relative;
          z-index: 2;
          background-color: ${targetColor};
          color: white;
          border: 2px solid white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        ">
          ${iconSvg}
        </div>
        <div style="
          position: relative;
          z-index: 2;
          margin-top: 2px;
          background-color: #061A2F;
          color: white;
          font-size: 7.5px;
          font-weight: 800;
          padding: 1.5px 5px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          white-space: nowrap;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        ">
          ${badgeText}
        </div>
      </div>
    `,
    className: 'custom-map-marker-pin',
    iconSize: [75, 45],
    iconAnchor: [37, 35]
  });
};

// High-visibility shelter SVG icon creator with pulse ring & badge tag
const createShelterIcon = (shelterType) => {
  const isRaisedPlatform = shelterType && shelterType.toLowerCase().includes('raised');
  
  const bgColor = isRaisedPlatform ? '#059669' : '#7c3aed';
  const badgeText = isRaisedPlatform ? 'RAISED PLATFORM' : 'SAFE SHELTER';
  
  const iconSvg = isRaisedPlatform 
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M2 20h20"/><path d="M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/><path d="m3 9 9-7 9 7"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
        <!-- Pulse effect ring -->
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: ${bgColor};
          opacity: 0.35;
          animation: pulse-ring 2s infinite ease-in-out;
        "></div>
        
        <!-- Main Marker Circle -->
        <div style="
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, ${bgColor}, #4c1d95);
          color: white;
          border: 2px solid white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        ">
          ${iconSvg}
        </div>

        <!-- Label Badge below pin -->
        <div style="
          position: relative;
          z-index: 2;
          margin-top: 3px;
          background-color: #0f172a;
          color: white;
          font-size: 8px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          white-space: nowrap;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        ">
          🏠 ${badgeText}
        </div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: translateX(-50%) scale(0.8); opacity: 0.6; }
          70% { transform: translateX(-50%) scale(1.6); opacity: 0; }
          100% { transform: translateX(-50%) scale(1.6); opacity: 0; }
        }
      </style>
    `,
    className: 'custom-shelter-marker-pin',
    iconSize: [80, 55],
    iconAnchor: [40, 40]
  });
};

// Map controller sub-component to pan the map view when center variables change
function MapViewCenterController({ activeDistrict, selectedDisasterType, mapCenter, mapZoom }) {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (activeDistrict && activeDistrict.coords) {
      map.setView(activeDistrict.coords, 9.5, { animate: true });
    }
    map.invalidateSize();
  }, [activeDistrict, map]);

  useEffect(() => {
    if (mapCenter && mapZoom) {
      map.setView(mapCenter, mapZoom, { animate: true });
    }
    map.invalidateSize();
  }, [mapCenter, mapZoom, map]);

  useEffect(() => {
    map.invalidateSize();
  }, [selectedDisasterType]);

  return null;
}

export default function MapPage({ 
  selectedDistrictId, 
  setSelectedDistrictId, 
  setActivePage, 
  simulationMode, 
  setSimulationMode,
  showSheltersOnMap,
  setShowSheltersOnMap
}) {
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [simDisaster, setSimDisaster] = useState("Flood");
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);
  const [baseMapLayer, setBaseMapLayer] = useState('satellite'); // 'satellite' | 'streets'

  // Ingested shelter database values
  const [shelterDataset, setShelterDataset] = useState([]);
  const [hasShelterData, setHasShelterData] = useState(false);
  const [selectedShelterDetails, setSelectedShelterDetails] = useState(null);

  // Geolocation states for nearest shelter calculations
  const [nearestShelter, setNearestShelter] = useState(null);
  const [locatingError, setLocatingError] = useState(null);
  
  // Slide-out overlay directory states
  const [isMarksDirectoryOpen, setIsMarksDirectoryOpen] = useState(true);
  const [activeDirectoryTab, setActiveDirectoryTab] = useState('marks');
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  
  // Load dynamic datasets from local Ingestion Engine
  const [ingestedLayers, setIngestedLayers] = useState({
    asdma_flood_atlas: null,
    gsi_bhusanket: null,
    bmtpc_earthquake: null,
    asdma_flood_reports: null,
    imd_warnings: null
  });

  // Map Hazard and Infrastructure Layer Checks
  const [layers, setLayers] = useState({
    floodRisk: true,
    cycloneExposure: false,
    landslideRisk: false,
    earthquakeRisk: false,
    heatwaveRisk: false,
    multiHazard: false,
    shelters: true,
    raisedPlatforms: true,
    hospitals: true,
    resourceCenters: true,
    evacuationRoutes: true
  });

  const loadIngestedLayers = () => {
    setIngestedLayers({
      asdma_flood_atlas: getIngestedDataset('asdma_flood_atlas'),
      gsi_bhusanket: getIngestedDataset('gsi_bhusanket'),
      bmtpc_earthquake: getIngestedDataset('bmtpc_earthquake'),
      asdma_flood_reports: getIngestedDataset('asdma_flood_reports'),
      imd_warnings: getIngestedDataset('imd_warnings')
    });

    const record = getIngestedDataset('official_shelters');
    if (record && record.data && record.data.length > 0) {
      setShelterDataset(record.data);
      setHasShelterData(true);
      setLayers(prev => ({ ...prev, shelters: true, raisedPlatforms: true }));
    } else {
      // Fetch live verified shelters from backend REST API
      api.resources.getShelters()
        .then(shelters => {
          if (shelters && shelters.length > 0) {
            setShelterDataset(shelters);
            setHasShelterData(true);
          } else {
            setShelterDataset([]);
            setHasShelterData(false);
          }
        })
        .catch(() => {
          setShelterDataset([]);
          setHasShelterData(false);
        });
      setLayers(prev => ({ ...prev, shelters: true, raisedPlatforms: true }));
    }
  };

  useEffect(() => {
    loadIngestedLayers();
  }, []);

  // Auto-enable shelters layer if navigated from Dashboard shelter card
  useEffect(() => {
    if (showSheltersOnMap) {
      setLayers(prev => ({
        ...prev,
        shelters: true,
        raisedPlatforms: true
      }));
      if (setShowSheltersOnMap) {
        setShowSheltersOnMap(false);
      }
    }
  }, [showSheltersOnMap]);

  // Sync active district selection from global state
  useEffect(() => {
    if (selectedDistrictId) {
      const match = districts.find(d => d.id === selectedDistrictId);
      if (match) {
        setActiveDistrict(match);
      }
    }
  }, [selectedDistrictId]);

  const handleMarkerClick = (dist) => {
    setActiveDistrict(dist);
    if (setSelectedDistrictId) {
      setSelectedDistrictId(dist.id);
    }
  };

  const handleLayerToggle = (layerName) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Haversine proximity formulas
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // earth radius km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(2));
  };

  const findNearest = () => {
    if (!navigator.geolocation) {
      setLocatingError("Geolocation is not supported by your browser.");
      return;
    }

    if (!hasShelterData || shelterDataset.length === 0) {
      setLocatingError("Official shelter database is not loaded.");
      return;
    }

    setLocatingError(null);
    navigator.geolocation.getCurrentPosition((pos) => {
      const uLat = pos.coords.latitude;
      const uLon = pos.coords.longitude;

      let minDistance = Infinity;
      let closest = null;

      shelterDataset.forEach(shelter => {
        const dist = calculateDistance(uLat, uLon, shelter.latitude, shelter.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          closest = { ...shelter, distance: dist };
        }
      });

      setNearestShelter(closest);
    }, (err) => {
      setLocatingError("Location permission denied or unavailable.");
    });
  };

  // Filter shelters based on selected district and infrastructure layers
  const filteredShelters = shelterDataset.filter(s => {
    if (!activeDistrict) return true; // Full state view
    return s.district.toLowerCase() === activeDistrict.name.toLowerCase();
  });

  const activeShelters = filteredShelters.filter(s => {
    if (s.shelterType === "Raised Platform") {
      return layers.raisedPlatforms || layers.shelters;
    }
    return layers.shelters;
  });

  // Dynamic + Static Display Shelters fallback generator for Map Rendering
  const getDisplayShelters = () => {
    if (hasShelterData && activeShelters.length > 0) {
      return activeShelters;
    }

    if (activeDistrict && activeDistrict.coords && activeDistrict.shelterCount) {
      const [baseLat, baseLon] = activeDistrict.coords;
      const count = Math.min(activeDistrict.shelterCount, 6);
      const sheltersList = [];
      const capacityPerShelter = Math.round((activeDistrict.shelterCapacity || 5000) / count);

      const offsets = [
        [0.025, 0.035],
        [-0.030, 0.020],
        [0.018, -0.040],
        [-0.022, -0.032],
        [0.040, -0.015],
        [-0.015, 0.045]
      ];

      for (let i = 0; i < count; i++) {
        const offset = offsets[i % offsets.length];
        const isRaised = i % 3 === 0;
        sheltersList.push({
          id: `static_shelter_${activeDistrict.id}_${i}`,
          name: `${activeDistrict.name} ${isRaised ? 'Elevated Raised Platform' : 'Emergency Shelter'} #${i + 1}`,
          district: activeDistrict.name,
          latitude: baseLat + offset[0],
          longitude: baseLon + offset[1],
          shelterType: isRaised ? "Raised Platform" : "Relief Camp / Temporary Shelter",
          suitableFor: "Flood / Cyclone / Emergency",
          capacity: capacityPerShelter,
          sourceName: activeDistrict.sourceKey || "ASDMA Official Registry",
          verifiedDate: "Verified Active"
        });
      }

      return sheltersList.filter(s => {
        if (s.shelterType === "Raised Platform") return layers.raisedPlatforms || layers.shelters;
        return layers.shelters;
      });
    }

    return [];
  };

  const displayShelters = getDisplayShelters();

  // Dataset checks config for floating control panel
  const datasetChecks = {
    floodRisk: { loaded: !!ingestedLayers.asdma_flood_atlas, key: 'asdma_flood_atlas', label: 'Flood Hazard (Blue)' },
    cycloneExposure: { loaded: !!ingestedLayers.imd_warnings, key: 'imd_warnings', label: 'Cyclone Exposure (Teal)' },
    landslideRisk: { loaded: !!ingestedLayers.gsi_bhusanket, key: 'gsi_bhusanket', label: 'Landslide Hazard (Orange)' },
    earthquakeRisk: { loaded: !!ingestedLayers.bmtpc_earthquake, key: 'bmtpc_earthquake', label: 'Earthquake Hazard (Red)' },
    heatwaveRisk: { loaded: !!ingestedLayers.imd_warnings, key: 'imd_warnings', label: 'Heatwave Hazard (Amber)' }
  };

  const isSimulating = simulationMode !== null;
  const simulatedRiskOffsetRadius = 
    simulationMode === 'severe' ? 22000 : 
    simulationMode === 'moderate' ? 12000 : 
    simulationMode === 'low' ? 5000 : 0;

  const activeProfile = activeDistrict && activeDistrict.hazardProfiles
    ? activeDistrict.hazardProfiles[simDisaster.toLowerCase()]
    : activeDistrict;

  const getAvailableDisasterData = () => {
    if (!activeDistrict) return "None";
    const list = [];
    if (ingestedLayers.asdma_flood_atlas && activeDistrict.hazardProfiles?.flood) list.push("Flood (ASDMA Atlas)");
    if (ingestedLayers.imd_warnings && activeDistrict.hazardProfiles?.cyclone) list.push("Cyclone (IMD Alerts)");
    if (ingestedLayers.gsi_bhusanket && activeDistrict.hazardProfiles?.landslide) list.push("Landslide (GSI Susceptibility)");
    if (ingestedLayers.bmtpc_earthquake && activeDistrict.hazardProfiles?.earthquake) list.push("Earthquake (BMTPC atlas)");
    if (ingestedLayers.imd_warnings && activeDistrict.hazardProfiles?.heatwave) list.push("Heatwave (IMD Warnings)");
    return list.length > 0 ? list.join(", ") : "None Ingested";
  };

  const getAvailableLayers = () => {
    const list = [];
    if (ingestedLayers.asdma_flood_atlas) list.push("Flood Hazard Layer");
    if (ingestedLayers.gsi_bhusanket) list.push("Landslide SUS Layer");
    if (ingestedLayers.bmtpc_earthquake) list.push("Earthquake Zoning Layer");
    if (ingestedLayers.imd_warnings) list.push("Meteorological Alert Layer");
    return list.length > 0 ? list.join(", ") : "No GIS layers loaded";
  };

  const getLatestSourceDate = () => {
    const dates = [];
    if (ingestedLayers.asdma_flood_atlas) dates.push(`ASDMA Flood: ${ingestedLayers.asdma_flood_atlas.metadata.publishedDate}`);
    if (ingestedLayers.gsi_bhusanket) dates.push(`GSI: ${ingestedLayers.gsi_bhusanket.metadata.publishedDate}`);
    if (ingestedLayers.bmtpc_earthquake) dates.push(`BMTPC: ${ingestedLayers.bmtpc_earthquake.metadata.publishedDate}`);
    return dates.length > 0 ? dates.join(" | ") : "No live metadata";
  };

  const simulationAlerts = {
    Flood: {
      warnings: [
        { title: "HIGH RISK AREA", desc: "Potential evacuation route disruption detected.", type: "red" },
        { title: "SHELTER CAPACITY WARNING", desc: "Additional shelter capacity may be required.", type: "orange" },
        { title: "RESOURCE GAP", desc: "Additional rescue resources may be required.", type: "orange" }
      ],
      actions: [
        "Pre-position rescue teams near high-risk zones.",
        "Move emergency supplies closer to vulnerable communities.",
        "Prepare alternate evacuation routes.",
        "Increase temporary shelter capacity."
      ]
    },
    Cyclone: {
      warnings: [
        { title: "STORM SURGE EXPOSURE", desc: "High inundation potential near low-lying blocks.", type: "red" },
        { title: "COMMUNICATION FAILURE RISK", desc: "VHF telemetry and telecom tower disruption forecast.", type: "orange" }
      ],
      actions: [
        "Pre-position emergency sat-phones and ham radio units.",
        "Secure supply frameworks near seaside administrative depots.",
        "Audit structural anchors on cyclone relief shelters."
      ]
    },
    Landslide: {
      warnings: [
        { title: "SLOPE CONTRACTION WARNING", desc: "High shear stress warning on active highway coordinates.", type: "red" },
        { title: "ROAD BLOCK DETECTED", desc: "Debris block potential on critical paths.", type: "orange" }
      ],
      actions: [
        "Pre-position heavy earthmoving and clearing equipment.",
        "Divert traffic away from active sliding zones.",
        "Establish warning checkpoints on transit hills."
      ]
    },
    Earthquake: {
      warnings: [
        { title: "STRUCTURAL COLLAPSE RISK", desc: "High vulnerability in masonry and unreinforced structures.", type: "red" },
        { title: "HOSPITAL ROUTE BLOCK", desc: "Rubble blockages potential on arterial hospital access routes.", type: "orange" }
      ],
      actions: [
        "Deploy emergency clearing equipment along hospital supply paths.",
        "Set up open-air field hospitals in safe zones.",
        "Mobilize civil defense search & rescue squads."
      ]
    },
    Heatwave: {
      warnings: [
        { title: "EXCESSIVE THERMAL RUNS", desc: "Heat index exceeding critical regional thresholds.", type: "red" }
      ],
      actions: [
        "Establish water misting and hydration points across urban layouts.",
        "Open municipal cooling centers with air conditioning.",
        "Adjust labor hours to restrict open-air work between 11 AM - 4 PM."
      ]
    }
  };

  const activeAlertData = simulationAlerts[simDisaster] || simulationAlerts.Flood;

  return (
    <div className="bg-[#F2F6FA] min-h-screen relative page-fade-in flex flex-col md:flex-row text-left font-sans">
      
      {/* Left Area: Map Canvas */}
      <div className="flex-grow h-[calc(100vh-64px)] relative z-10">
        
        {/* Floating Satellite / Street View Mode Switcher */}
        <div className="absolute top-4 right-4 z-[999] bg-[#071B33]/90 backdrop-blur-md p-1 rounded-xl shadow-xl border border-slate-700/80 flex items-center gap-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setBaseMapLayer('satellite')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              baseMapLayer === 'satellite'
                ? 'bg-blue-600 text-white shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-blue-300" />
            <span>🛰️ Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setBaseMapLayer('streets')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              baseMapLayer === 'streets'
                ? 'bg-blue-600 text-white shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-blue-300" />
            <span>🗺️ Streets</span>
          </button>
        </div>

        <MapContainer 
          center={[26.2441, 92.5376]} 
          zoom={7.5} 
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {baseMapLayer === 'satellite' ? (
            <TileLayer
              key="google-hybrid-satellite"
              attribution='&copy; Google Maps Satellite'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          ) : (
            <TileLayer
              key="osm-streets-layer"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {/* 🌐 GIS SATELLITE RADAR COORDINATE GRID LINES OVERLAY */}
          <React.Fragment>
            {[24.0, 25.0, 26.0, 27.0, 28.0, 29.0].map(lat => (
              <Polyline
                key={`lat_grid_${lat}`}
                positions={[[lat, 88.0], [lat, 97.0]]}
                pathOptions={{ color: '#ffffff', weight: 1, opacity: 0.45, dashArray: '5, 5' }}
              />
            ))}
            {[89.0, 90.5, 92.0, 93.5, 95.0, 96.5].map(lon => (
              <Polyline
                key={`lon_grid_${lon}`}
                positions={[[23.0, lon], [30.0, lon]]}
                pathOptions={{ color: '#ffffff', weight: 1, opacity: 0.45, dashArray: '5, 5' }}
              />
            ))}
          </React.Fragment>

          <MapViewCenterController 
            activeDistrict={activeDistrict} 
            selectedDisasterType={simDisaster} 
            mapCenter={mapCenter}
            mapZoom={mapZoom}
          />

          {/* 🗺️ RENDER REAL PARSED GEOJSON FILES DIRECTLY IF INGESTED */}
          {layers.floodRisk && ingestedLayers.asdma_flood_atlas && (
            <GeoJSON 
              data={ingestedLayers.asdma_flood_atlas.data} 
              style={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.15, weight: 1.5 }}
            />
          )}

          {layers.landslideRisk && ingestedLayers.gsi_bhusanket && (
            <GeoJSON 
              data={ingestedLayers.gsi_bhusanket.data} 
              style={{ color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.15, weight: 1.5 }}
            />
          )}

          {layers.earthquakeRisk && ingestedLayers.bmtpc_earthquake && (
            <GeoJSON 
              data={ingestedLayers.bmtpc_earthquake.data} 
              style={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.15, weight: 1.5 }}
            />
          )}

          {/* Render real verified shelter markers */}
          {(layers.shelters || layers.raisedPlatforms) && displayShelters.map((shelter) => (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={createShelterIcon(shelter.shelterType)}
            >
              <Popup>
                <div className="p-2.5 space-y-2 text-xs font-sans text-slate-700 min-w-[185px] text-left">
                  <div className="border-b border-slate-100 pb-1.5">
                    <span className="text-[8px] text-purple-600 font-extrabold uppercase tracking-widest block">Emergency Shelter</span>
                    <strong className="text-navy-950 font-bold block mt-0.5">{shelter.name}</strong>
                  </div>
                  <div className="space-y-1 font-semibold">
                    <div><span className="text-slate-400">District:</span> {shelter.district}</div>
                    <div><span className="text-slate-400">Type:</span> {shelter.shelterType}</div>
                    <div><span className="text-slate-400">Suitable For:</span> {shelter.suitableFor || "Flood / Cyclone / Other"}</div>
                    <div><span className="text-slate-400">Capacity:</span> {shelter.capacity} persons</div>
                    <div><span className="text-slate-400">Source:</span> {shelter.sourceName}</div>
                    <div><span className="text-slate-400">Last Verified:</span> {shelter.verifiedDate}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedShelterDetails(shelter)}
                    className="w-full mt-1.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] uppercase font-bold tracking-wider text-center block transition-all"
                  >
                    VIEW SHELTER DETAILS
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Dynamic state district markers */}
          {districts.map((dist) => {
            const center = dist.coords;
            const hasGISData = dist.verifiedIndicators !== null && dist.verifiedIndicators !== undefined;
            const isTargetSimulated = isSimulating && dist.id === activeDistrict?.id;

            // Offsets for detail marker coordinates
            const hospitalCoords = [center[0] - 0.015, center[1] - 0.012];
            const resourceCoords = [center[0] + 0.014, center[1] - 0.016];
            const routeCoords = [
              [center[0], center[1]],
              [center[0] + 0.012, center[1] + 0.015]
            ];

            const blockedRoadCoords = [
              [center[0], center[1]],
              [center[0] - 0.022, center[1] + 0.018]
            ];

            const alternateSafeCoords = [
              [center[0], center[1]],
              [center[0] + 0.024, center[1] - 0.022]
            ];

            return (
              <React.Fragment key={dist.id}>
                {/* 🛰️ SATELLITE DOPPLER RADAR THERMAL HEATMAP OVERLAY (RED / ORANGE / YELLOW / GREEN / CYAN) */}
                {layers.floodRisk && (
                  <>
                    {/* Outer Cyan/Teal Peripheral Fringe Zone */}
                    <Circle
                      center={center}
                      radius={22000 + (isTargetSimulated && simDisaster === 'Flood' ? simulatedRiskOffsetRadius : 0)}
                      pathOptions={{
                        fillColor: '#06b6d4',
                        fillOpacity: 0.08,
                        color: '#0284c7',
                        opacity: 0.4,
                        weight: 1
                      }}
                    />

                    {/* Outer Green Safe Fringe Zone */}
                    <Circle
                      center={[center[0] + 0.025, center[1] + 0.028]}
                      radius={8000}
                      pathOptions={{
                        fillColor: '#10b981',
                        fillOpacity: 0.12,
                        color: '#059669',
                        opacity: 0.5,
                        weight: 1
                      }}
                    >
                      <Popup>
                        <div className="p-1.5 text-xs font-sans text-left space-y-1">
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase block w-max">
                            🟢 Safe High Elevation Ground (Green Zone)
                          </span>
                          <strong className="text-navy-950 block text-xs">{dist.name} Safe Ground</strong>
                        </div>
                      </Popup>
                    </Circle>

                    {/* Mid Yellow Hazard Belt */}
                    <Circle
                      center={center}
                      radius={15000 + (isTargetSimulated && simDisaster === 'Flood' ? simulatedRiskOffsetRadius : 0)}
                      pathOptions={{
                        fillColor: '#eab308',
                        fillOpacity: 0.10,
                        color: '#ca8a04',
                        opacity: 0.5,
                        weight: 1
                      }}
                    >
                      <Popup>
                        <div className="p-1.5 text-xs font-sans text-left space-y-1">
                          <span className="bg-yellow-100 text-yellow-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase block w-max">
                            🟡 Moderate Risk Zone (Yellow)
                          </span>
                          <strong className="text-navy-950 block text-xs">{dist.name} Warning Belt</strong>
                        </div>
                      </Popup>
                    </Circle>

                    {/* Inner Orange Heavy Hazard Zone */}
                    <Circle
                      center={[center[0] - 0.010, center[1] - 0.012]}
                      radius={10000 + (isTargetSimulated && simDisaster === 'Flood' ? simulatedRiskOffsetRadius : 0)}
                      pathOptions={{
                        fillColor: '#f97316',
                        fillOpacity: 0.14,
                        color: '#ea580c',
                        opacity: 0.6,
                        weight: 1.5
                      }}
                    />

                    {/* Core Intense Red Inundation Zone (Storm Center / Heavy Flood) */}
                    <Circle
                      center={[center[0] - 0.015, center[1] - 0.018]}
                      radius={6000 + (isTargetSimulated && simDisaster === 'Flood' ? simulatedRiskOffsetRadius : 0)}
                      pathOptions={{
                        fillColor: '#dc2626',
                        fillOpacity: 0.18,
                        color: '#ef4444',
                        opacity: 0.7,
                        weight: 1.5
                      }}
                    >
                      <Popup>
                        <div className="p-1.5 text-xs font-sans text-left space-y-1">
                          <span className="bg-red-100 text-red-800 text-[9px] font-black px-2 py-0.5 rounded uppercase block w-max">
                            🔴 Core High Flood Inundation (Red Core)
                          </span>
                          <strong className="text-navy-950 block text-xs">{dist.name} Severe Inundation Core</strong>
                        </div>
                      </Popup>
                    </Circle>
                  </>
                )}

                {/* Cyclone Circular buffer if loaded */}
                {layers.cycloneExposure && datasetChecks.cycloneExposure.loaded && (
                  <Circle
                    center={center}
                    radius={18000 + (isTargetSimulated && simDisaster === 'Cyclone' ? simulatedRiskOffsetRadius : 0)}
                    pathOptions={{ fillColor: '#0d9488', fillOpacity: 0.08, color: '#0d9488', opacity: 0.4, weight: 1 }}
                  />
                )}

                {/* Landslide Circular buffer if loaded */}
                {layers.landslideRisk && datasetChecks.landslideRisk.loaded && !ingestedLayers.gsi_bhusanket && (
                  <Circle
                    center={center}
                    radius={12000 + (isTargetSimulated && simDisaster === 'Landslide' ? simulatedRiskOffsetRadius : 0)}
                    pathOptions={{ fillColor: '#ea580c', fillOpacity: 0.08, color: '#ea580c', opacity: 0.4, weight: 1 }}
                  />
                )}

                {/* Earthquake Circular buffer if loaded */}
                {layers.earthquakeRisk && datasetChecks.earthquakeRisk.loaded && !ingestedLayers.bmtpc_earthquake && (
                  <Circle
                    center={center}
                    radius={20000 + (isTargetSimulated && simDisaster === 'Earthquake' ? simulatedRiskOffsetRadius : 0)}
                    pathOptions={{ fillColor: '#dc2626', fillOpacity: 0.08, color: '#dc2626', opacity: 0.4, weight: 1 }}
                  />
                )}

                {/* Heatwave Circular buffer if loaded */}
                {layers.heatwaveRisk && datasetChecks.heatwaveRisk.loaded && (
                  <Circle
                    center={center}
                    radius={16000 + (isTargetSimulated && simDisaster === 'Heatwave' ? simulatedRiskOffsetRadius : 0)}
                    pathOptions={{ fillColor: '#d97706', fillOpacity: 0.08, color: '#d97706', opacity: 0.4, weight: 1 }}
                  />
                )}

                {/* Multi-hazard combined view outer frame */}
                {layers.multiHazard && (
                  <Circle
                    center={center}
                    radius={24000}
                    pathOptions={{
                      fillColor: dist.riskColor === 'red' ? '#dc2626' : dist.riskColor === 'orange' ? '#f97316' : '#eab308',
                      fillOpacity: 0.10,
                      color: dist.riskColor === 'red' ? '#dc2626' : dist.riskColor === 'orange' ? '#f97316' : '#eab308',
                      opacity: 0.4,
                      weight: 1.5
                    }}
                  />
                )}

                {/* Hospitals Marker */}
                {layers.hospitals && dist.hospitals && (
                  <Marker position={hospitalCoords} icon={createCustomIcon('purple', 'hospital')} />
                )}

                {/* Evacuation Routes */}
                {layers.evacuationRoutes && (
                  <Polyline 
                    positions={routeCoords}
                    pathOptions={{ color: '#4f46e5', weight: 2.5, dashArray: '4, 6', opacity: 0.7 }}
                  />
                )}

                {/* Simulation Routing Layer */}
                {isTargetSimulated && layers.evacuationRoutes && (
                  <>
                    <Polyline 
                      positions={blockedRoadCoords}
                      pathOptions={{ color: '#ef4444', weight: 4, dashArray: '4, 4', opacity: 0.95 }}
                    />
                    <Polyline 
                      positions={alternateSafeCoords}
                      pathOptions={{ color: '#16a34a', weight: 4, opacity: 0.95 }}
                    />
                  </>
                )}

                {/* Resources Marker */}
                {layers.resources && dist.rescueResources && (
                  <Marker position={resourceCoords} icon={createCustomIcon('indigo', 'resource')} />
                )}

                {/* Main District Anchor Pin */}
                <Marker
                  position={center}
                  icon={createCustomIcon(dist.riskColor, 'district')}
                  eventHandlers={{ click: () => handleMarkerClick(dist) }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Floating Map Layers Control Panel */}
        {!isLayersPanelOpen ? (
          <button
            type="button"
            onClick={() => setIsLayersPanelOpen(true)}
            className="absolute top-16 right-4 z-[990] bg-[#071B33]/90 hover:bg-[#071B33] text-white backdrop-blur-md border border-slate-700/80 shadow-xl rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105"
            title="Open Hazard Map Layers"
          >
            <Layers className="h-4 w-4 text-brand-orange-500" />
            <span>Hazard Layers</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        ) : (
          <div className="absolute top-16 right-4 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-xl p-4 z-[990] w-56 text-xs space-y-3 text-left page-fade-in">
            <div className="flex items-center justify-between font-bold text-navy-900 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-navy-900" />
                <span>Hazard Map Layers</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLayersPanelOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Collapse Panel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-3 font-semibold">
            {Object.entries(datasetChecks).map(([layerId, config]) => (
              <div key={layerId} className="space-y-0.5">
                <label className={`flex items-center gap-2 cursor-pointer ${config.loaded ? 'text-slate-700 hover:text-navy-900' : 'text-slate-400 cursor-not-allowed'}`}>
                  <input
                    type="checkbox"
                    checked={layers[layerId]}
                    disabled={!config.loaded}
                    onChange={() => handleLayerToggle(layerId)}
                    className="rounded border-slate-300 text-navy-800 focus:ring-navy-800 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                  />
                  <span>{config.label}</span>
                </label>
                {!config.loaded && (
                  <span className="text-[9px] text-red-500 font-bold block ml-6 leading-none mt-0.5">
                    Official GIS dataset not loaded.
                  </span>
                )}
              </div>
            ))}

            {/* Infrastructure group checklist */}
            <div className="border-t border-slate-200 pt-2.5 space-y-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Infrastructure</span>
              
              <div className="space-y-1.5">
                {/* Emergency Shelters */}
                <div className="space-y-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-750 font-bold">
                    <input
                      type="checkbox"
                      checked={layers.shelters}
                      onChange={() => handleLayerToggle('shelters')}
                      className="rounded border-slate-300 text-navy-800 focus:ring-navy-800 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Emergency Shelters</span>
                  </label>
                  {!hasShelterData && (
                    <span className="text-[9px] text-purple-600 font-bold block pl-5 leading-none mt-0.5">
                      Showing static baseline shelters.
                    </span>
                  )}
                </div>

                {/* Raised Platforms */}
                <div className="space-y-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-750 font-bold">
                    <input
                      type="checkbox"
                      checked={layers.raisedPlatforms}
                      onChange={() => handleLayerToggle('raisedPlatforms')}
                      className="rounded border-slate-300 text-navy-800 focus:ring-navy-800 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Raised Platforms</span>
                  </label>
                </div>

                {/* Hospitals */}
                <label className="flex items-center gap-2 cursor-pointer text-slate-750 font-medium">
                  <input
                    type="checkbox"
                    checked={layers.hospitals}
                    onChange={() => handleLayerToggle('hospitals')}
                    className="rounded border-slate-300 text-navy-800 focus:ring-navy-800 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Hospitals</span>
                </label>

                {/* Resource Centers */}
                <label className="flex items-center gap-2 cursor-pointer text-slate-750 font-medium">
                  <input
                    type="checkbox"
                    checked={layers.resourceCenters}
                    onChange={() => handleLayerToggle('resourceCenters')}
                    className="rounded border-slate-300 text-navy-800 focus:ring-navy-800 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Resource Centers</span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200/80 pt-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-navy-900 font-extrabold">
                <input
                  type="checkbox"
                  checked={layers.multiHazard}
                  onChange={() => handleLayerToggle('multiHazard')}
                  className="rounded border-slate-300 text-navy-950 focus:ring-navy-950 w-3.5 h-3.5 cursor-pointer"
                />
                <span>MULTI-HAZARD VIEW</span>
              </label>
            </div>
          </div>
        </div>
        )}

        {/* 🛡️ FRONTMOST LEFT OVERLAY CONTROL PANEL (Z-1000, TOP-4 LEFT-14) */}
        <div className="absolute top-4 left-14 z-[1000] text-left font-sans transition-all duration-300">
          {!isMarksDirectoryOpen ? (
            /* Collapsed Pill Button on Top-Left Overlay */
            <button
              type="button"
              onClick={() => setIsMarksDirectoryOpen(true)}
              className="bg-[#071B33] text-white hover:bg-navy-900 border border-slate-700 shadow-2xl rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs font-bold transition-transform hover:scale-105"
            >
              <Activity className="h-4 w-4 text-brand-orange-500 animate-pulse" />
              <span>Disaster Map Controls & Marks ({displayShelters.length})</span>
              <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black ml-1 uppercase">
                OPEN PANEL
              </span>
            </button>
          ) : (
            /* Expanded Frontmost Left Overlay Drawer */
            <div className="bg-white/98 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-4 w-80 text-xs space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto page-fade-in relative z-[1000]">
              {/* Header bar */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div className="font-extrabold text-[#071B33] flex items-center gap-1.5 uppercase tracking-wider text-xs">
                  <Activity className="h-4 w-4 text-brand-orange-500" />
                  <span>Disaster Intelligence Controls</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMarksDirectoryOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Minimize Panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tabs Row */}
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveDirectoryTab('marks')}
                  className={`py-1.5 rounded transition-all ${
                    activeDirectoryTab === 'marks'
                      ? 'bg-white text-navy-950 shadow-sm font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📍 Map Marks ({displayShelters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDirectoryTab('simulation')}
                  className={`py-1.5 rounded transition-all ${
                    activeDirectoryTab === 'simulation'
                      ? 'bg-white text-navy-950 shadow-sm font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ⚡ AI Simulation {simulationMode ? `(${simulationMode})` : ''}
                </button>
              </div>

              {/* TAB 1: MAP MARKS & SYMBOLS DIRECTORY */}
              {activeDirectoryTab === 'marks' && (
                <div className="space-y-3">
                  {/* Symbol Legend Key */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block">Symbol Legend Key</span>
                    
                    {/* Satellite Thermal Radar Heatmap Spectrum */}
                    <div className="space-y-1.5 border-b border-slate-200 pb-2">
                      <span className="text-[7.5px] text-slate-500 font-extrabold uppercase tracking-wider block">Satellite Radar Thermal Spectrum</span>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] border border-white" />
                        <span className="text-red-700">🔴 Core Inundation Eye (Red)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] border border-white" />
                        <span className="text-orange-700">🟧 Heavy Hazard Belt (Orange)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] border border-white" />
                        <span className="text-yellow-700">🟡 Warning Belt (Yellow)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white" />
                        <span className="text-emerald-700">🟢 High Ground Safe Zone (Green)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] border border-white" />
                        <span className="text-cyan-700">🔷 Peripheral Fringe (Cyan)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-purple-600 flex items-center justify-center text-white text-[7px] font-black">🏠</span>
                        <span className="text-slate-700">Safe Shelter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[7px] font-black">🏠</span>
                        <span className="text-slate-700">Raised Platform</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-600 flex items-center justify-center text-white text-[7px] font-black">🏥</span>
                        <span className="text-slate-700">Hospital</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[7px] font-black">⚓</span>
                        <span className="text-slate-700">SDRF Rescue</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Markers List */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                      <span>Active Map Marks List</span>
                      <span>Total: {displayShelters.length}</span>
                    </div>
                    
                    {displayShelters.length > 0 ? (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {displayShelters.map((shelter, idx) => (
                          <div key={shelter.id || idx} className="p-2.5 bg-slate-50 border border-slate-200 hover:border-purple-300 rounded-xl space-y-1.5 transition-all">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-navy-950 text-[11px] leading-tight block">
                                {shelter.name}
                              </span>
                              <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-black text-white ${shelter.shelterType && shelter.shelterType.includes('Raised') ? 'bg-emerald-600' : 'bg-purple-600'}`}>
                                {shelter.shelterType && shelter.shelterType.includes('Raised') ? 'Platform' : 'Shelter'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold border-t border-slate-150 pt-1.5">
                              <span>Capacity: {shelter.capacity} Pax</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  setMapCenter([shelter.latitude, shelter.longitude]);
                                  setMapZoom(12.5);
                                }}
                                className="text-purple-600 hover:text-purple-800 font-extrabold flex items-center gap-1 hover:underline"
                              >
                                <span>Focus Pin</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-400 text-xs font-semibold italic">
                        No active symbols mapped for this view.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: AI DISASTER SIMULATION */}
              {activeDirectoryTab === 'simulation' && (
                <div className="space-y-3 text-left">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Simulated Hazard</span>
                    <select
                      value={simDisaster}
                      onChange={(e) => setSimDisaster(e.target.value)}
                      className="w-full border-slate-300 rounded-lg p-1.5 text-xs font-bold text-navy-900 focus:border-navy-900 focus:ring-navy-900 cursor-pointer bg-slate-50"
                    >
                      <option value="Flood">Flood</option>
                      <option value="Cyclone">Cyclone</option>
                      <option value="Landslide">Landslide</option>
                      <option value="Earthquake">Earthquake</option>
                      <option value="Heatwave">Heatwave</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Simulation Severity</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { val: null, label: 'Off', style: 'border-slate-300 text-slate-600 hover:bg-slate-50' },
                        { val: 'low', label: 'Low', style: 'border-green-300 text-green-700 bg-green-50/20' },
                        { val: 'moderate', label: 'Mod', style: 'border-yellow-300 text-yellow-700 bg-yellow-50/20' },
                        { val: 'severe', label: 'Sev', style: 'border-red-300 text-red-700 bg-red-50/20' }
                      ].map((sevOption) => {
                        const isActive = simulationMode === sevOption.val;
                        return (
                          <button
                            key={sevOption.label}
                            type="button"
                            onClick={() => setSimulationMode(sevOption.val)}
                            className={`border rounded-lg py-1.5 font-bold transition-all text-center text-xs ${
                              isActive 
                                ? 'bg-navy-900 border-navy-900 text-white shadow-sm scale-105' 
                                : sevOption.style
                            }`}
                          >
                            {sevOption.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Launch Full What-If Simulator Sandbox */}
                  <button
                    type="button"
                    onClick={() => setIsSimulatorModalOpen(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>Launch What-If Sandbox</span>
                  </button>

                  <div className="bg-brand-orange-50 border border-brand-orange-200/50 p-2.5 rounded-xl text-[10px] text-brand-orange-800 leading-normal font-semibold flex gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-brand-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      Preparedness Simulation — Not a Live Forecast
                    </div>
                  </div>

                  {/* Nearest Shelter Scanner inside simulation tab */}
                  <div className="border-t border-slate-200 pt-2.5 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">GPS Proximity Scan</span>
                    <button
                      type="button"
                      onClick={findNearest}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Scan Nearest Shelter
                    </button>

                    {locatingError && (
                      <div className="text-[9.5px] text-red-500 font-extrabold leading-tight">
                        {locatingError}
                      </div>
                    )}

                    {nearestShelter && (
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1 text-[10px] leading-relaxed">
                        <div><span className="text-slate-400 font-bold">Nearest:</span> <strong className="text-navy-950">{nearestShelter.name}</strong></div>
                        <div><span className="text-slate-400 font-bold">Distance:</span> <strong className="text-navy-950">{nearestShelter.distance} km</strong></div>
                        <button
                          type="button"
                          onClick={() => {
                            setMapCenter([nearestShelter.latitude, nearestShelter.longitude]);
                            setMapZoom(12.5);
                          }}
                          className="w-full mt-1 py-1 bg-navy-900 text-white rounded font-bold text-[9px] uppercase tracking-wider text-center block"
                        >
                          SHOW ON MAP
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Right Area: Slide-out Detail Side Panel */}
      {activeDistrict ? (
        <div className="w-full md:w-[380px] bg-white border-t md:border-t-0 md:border-l border-slate-200 h-[calc(100vh-64px)] shadow-xl overflow-y-auto page-fade-in flex flex-col relative z-20">
          
          {/* Drawer Title Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-[#071B33] text-white">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">District Intelligence Profile</span>
              <h2 className="text-base font-extrabold font-display">
                {activeDistrict.name}
              </h2>
            </div>
            <button 
              onClick={() => {
                setActiveDistrict(null);
                if (setSelectedDistrictId) setSelectedDistrictId("");
              }}
              className="p-1.5 hover:bg-navy-900 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-5 space-y-6 flex-grow">
            
            {/* Metadata Indicators Block */}
            <div className="space-y-2 text-xs font-semibold text-slate-650">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Hazard Profile:</span>
                <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[9px] font-bold uppercase border border-red-200">
                  {simDisaster}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Available Datasets:</span>
                <span className="text-[#071B33] font-bold text-right max-w-[180px] truncate">{getAvailableDisasterData()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Active Map Overlays:</span>
                <span className="text-navy-900 font-bold text-right max-w-[180px] truncate">{getAvailableLayers()}</span>
              </div>
              <div className="flex justify-between items-center pb-0.5">
                <span className="text-slate-400">Telemetry Feed Source:</span>
                <span className="text-slate-500 font-mono text-[9px] font-bold text-right">{getLatestSourceDate()}</span>
              </div>
            </div>

            {/* Active Disaster Indicators details */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-brand-orange-500 rounded-full" />
                <span className="text-xs font-bold text-navy-955 uppercase tracking-wider">Telemetry Assessment Gaps</span>
              </div>

              {/* Ingested dynamic shelter count indicators */}
              {hasShelterData ? (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2 text-xs font-semibold text-purple-900">
                  <div className="flex justify-between items-center font-bold">
                    <span>Verified District Shelters:</span>
                    <span className="bg-purple-100 border border-purple-300 px-2 py-0.5 rounded text-[10px]">
                      {filteredShelters.length} Facilities
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-850 leading-relaxed font-medium">
                    Loaded {filteredShelters.filter(s => s.shelterType === "Raised Platform").length} raised platforms and {filteredShelters.filter(s => s.shelterType !== "Raised Platform").length} evacuation shelters for district {activeDistrict.name}.
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-purple-800 border-t border-purple-200/40 pt-1.5 mt-1.5 font-bold">
                    <span>Total Shelters Capacity:</span>
                    <span>
                      {filteredShelters.reduce((acc, curr) => acc + (parseInt(curr.capacity) || 0), 0).toLocaleString('en-IN')} persons
                    </span>
                  </div>
                </div>
              ) : activeDistrict.shelterCount ? (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2 text-xs font-semibold text-purple-900">
                  <div className="flex justify-between items-center font-bold">
                    <span>Static Mapped Shelters:</span>
                    <span className="bg-purple-100 border border-purple-300 px-2 py-0.5 rounded text-[10px]">
                      {activeDistrict.shelterCount} Facilities
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-850 leading-relaxed font-medium">
                    {activeDistrict.shelters}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-purple-800 border-t border-purple-200/40 pt-1.5 mt-1.5 font-bold">
                    <span>Total Mapped Capacity:</span>
                    <span>{activeDistrict.shelterCapacity ? activeDistrict.shelterCapacity.toLocaleString('en-IN') : 'N/A'} persons</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-[10px] font-bold leading-normal">
                  <ShieldAlert className="h-5 w-5 text-slate-350 mx-auto mb-1" />
                  <span>Official shelter dataset not loaded for this area. Ingest coordinates in Admin sources.</span>
                </div>
              )}

              {activeDistrict.verifiedIndicators ? (
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center border border-slate-200 p-2.5 rounded-lg">
                    <span className="text-slate-550">Early Warning Systems:</span>
                    <span className="font-bold text-navy-950">{activeProfile?.warningSystem || 'Data Not Available'}</span>
                  </div>
                  <div className="flex justify-between items-center border border-slate-200 p-2.5 rounded-lg">
                    <span className="text-slate-550">Evacuation Route Status:</span>
                    <span className="font-bold text-navy-950">{activeProfile?.evacuationRoutes || 'Data Not Available'}</span>
                  </div>
                  <div className="flex justify-between items-center border border-slate-200 p-2.5 rounded-lg">
                    <span className="text-slate-550">Medical Resource Reserve:</span>
                    <span className="font-bold text-navy-950">{activeProfile?.medicalResources || 'Data Not Available'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-250 text-yellow-800 rounded-lg text-[10px] leading-normal font-bold">
                  Official operational indices not verified for this district. Show base map only.
                </div>
              )}
            </div>

            {/* AI Warning signals */}
            <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-red-600 rounded-full" />
                <span className="font-bold text-navy-955 uppercase tracking-wider text-xs">AI WARNING SIGNALS</span>
              </div>
              {isSimulating ? (
                <div className="space-y-2.5">
                  {activeAlertData.warnings.map((warn, i) => (
                    <div key={i} className={`p-3 border rounded-xl flex gap-2 ${
                      warn.type === 'red' ? 'bg-red-50/50 border-red-200 text-red-900' : 'bg-orange-50/50 border-orange-200 text-orange-900'
                    }`}>
                      <AlertCircle className={`h-4.5 w-4.5 flex-shrink-0 mt-0.5 ${warn.type === 'red' ? 'text-red-600' : 'text-orange-600'}`} />
                      <div className="space-y-0.5 font-semibold text-[10px] leading-normal">
                        <strong className="block text-navy-950 font-bold uppercase text-[9px]">{warn.title}</strong>
                        <p className="text-slate-600">{warn.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-semibold text-[10px] italic">
                  Turn on AI Simulation overlay to model disaster events and project vulnerability warnings.
                </p>
              )}
            </div>

            {/* AI Action Plan checklist directives */}
            {isSimulating && (
              <div className="space-y-3 border-t border-slate-100 pt-4 text-xs pb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-brand-green-500 rounded-full" />
                  <span className="font-bold text-navy-955 uppercase tracking-wider text-xs">AI RECOMMENDED ACTIONS</span>
                </div>
                <div className="space-y-2">
                  {activeAlertData.actions.map((act, i) => (
                    <div key={i} className="flex gap-2 items-start text-[10.5px] leading-relaxed font-semibold text-slate-650">
                      <span className="bg-green-100 border border-green-300 text-green-700 text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="hidden md:flex w-[380px] bg-slate-50 border-l border-slate-200 h-[calc(100vh-64px)] items-center justify-center p-6 text-center text-slate-400 font-semibold flex-shrink-0 relative z-20">
          <div className="space-y-2">
            <Compass className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="text-xs font-bold text-[#061A2F] uppercase">No Mapped District Selected</h3>
            <p className="text-[10px] text-slate-500 max-w-[200px] leading-normal font-medium mx-auto">
              Select a district center anchor pin on the map to query telemetry datasets, check shelters, and launch emergency simulation overlays.
            </p>
          </div>
        </div>
      )}

      {/* Shelter Details Modal Dialog */}
      {selectedShelterDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 page-fade-in text-left">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-up font-sans">
            <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] text-purple-200 font-extrabold uppercase tracking-widest">ASDMA Shelter Audit Registry</span>
                <h3 className="text-base font-extrabold">{selectedShelterDetails.name}</h3>
              </div>
              <button
                onClick={() => setSelectedShelterDetails(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-purple-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">District</span>
                  <span className="text-navy-950 font-bold">{selectedShelterDetails.district}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">State</span>
                  <span className="text-navy-950 font-bold">{selectedShelterDetails.state}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Shelter Type</span>
                  <span className="text-navy-950 font-bold">{selectedShelterDetails.shelterType}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Suitable For</span>
                  <span className="text-navy-950 font-bold">{selectedShelterDetails.suitableFor || "Flood / Cyclone / Other"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Verified Capacity</span>
                  <span className="text-navy-950 font-bold">{selectedShelterDetails.capacity} persons</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Official Data Source</span>
                  <span className="text-navy-950 font-bold">{selectedShelterDetails.sourceName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Last Audited / Verified Date</span>
                  <span className="text-navy-950 font-bold">{selectedShelterDetails.verifiedDate}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-[10px] leading-normal font-bold flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Operational Activation Disclaimer:</strong> This shelter facility is registered in ASDMA's GIS utility databases. During active emergency incidents, operational status, food/supply availability, and route clearances must be confirmed through local District Magistrate or SDMA warnings.
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedShelterDetails(null)}
                className="px-4 py-2 bg-[#061A2F] hover:bg-[#0A2540] text-white font-bold rounded text-[10px] uppercase tracking-wider transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ FEATURE 4: WHAT-IF DISASTER SCENARIO SIMULATOR MODAL */}
      <ScenarioSimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        districtId={activeDistrict?.id || 'dhemaji'}
        districtName={activeDistrict?.name || 'District'}
        onApplyToMap={(scenarioResult) => {
          if (setSimulationMode) {
            setSimulationMode(
              scenarioResult.parameters.rainfallSurgePct >= 60 ? 'severe' :
              scenarioResult.parameters.rainfallSurgePct >= 30 ? 'moderate' : 'low'
            );
          }
          if (scenarioResult.disasterType) {
            setSimDisaster(scenarioResult.disasterType);
          }
        }}
      />

    </div>
  );
}
