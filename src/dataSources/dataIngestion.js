// Data Ingestion and Parser module for RESILIENCE AI

// Custom CSV Parser supporting quoted fields
export const parseCSV = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''));
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] !== undefined ? values[index] : '';
    });
    return obj;
  });
};

// GeoJSON validator and parser
export const parseGeoJSON = (text) => {
  const data = JSON.parse(text);
  if (data && (data.type === 'FeatureCollection' || data.type === 'Feature')) {
    return data;
  }
  throw new Error("Invalid GeoJSON: Root must be a Feature or FeatureCollection.");
};

// PDF/General Manual Document registration
export const parsePDFMetadata = (fileName, docTitle, authority, hazard, year) => {
  return {
    documentName: fileName,
    docTitle: docTitle,
    authority: authority,
    hazard: hazard,
    publishedYear: year,
    ingestionType: "Manual PDF Import",
    registeredAt: new Date().toISOString()
  };
};

// LocalStorage database storage keys
const STORAGE_PREFIX = "resilience_dataset_";

export const getIngestedDataset = (key) => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error loading dataset from localStorage:", e);
    return null;
  }
};

export const saveIngestedDataset = (key, data, metadata) => {
  try {
    const record = {
      data: data,
      metadata: {
        ...metadata,
        lastUpdated: new Date().toISOString()
      }
    };
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(record));
    return true;
  } catch (e) {
    console.error("Error saving dataset to localStorage:", e);
    throw new Error("Storage quota exceeded. Please upload a smaller dataset.");
  }
};

export const deleteIngestedDataset = (key) => {
  localStorage.removeItem(STORAGE_PREFIX + key);
};

// List of official datasets in the system
export const officialDatasetRegistry = [
  {
    key: "asdma_flood_atlas",
    name: "Flood Hazard Zonal Atlas 1998–2023",
    authority: "ASDMA",
    hazard: "Flood",
    coverage: "Assam State",
    dataType: "GeoJSON / JSON Map Layers",
    defaultStatus: "Unavailable"
  },
  {
    key: "asdma_flood_reports",
    name: "ASDMA Assam Daily Flood Reports",
    authority: "ASDMA",
    hazard: "Flood",
    coverage: "District / Block Level",
    dataType: "CSV / JSON Tables",
    defaultStatus: "Unavailable"
  },
  {
    key: "asdma_fews",
    name: "Flood Early Warning System (FEWS)",
    authority: "ASDMA",
    hazard: "Flood",
    coverage: "River Basins",
    dataType: "API JSON Feed",
    defaultStatus: "Connected"
  },
  {
    key: "asdma_ddmp",
    name: "District Disaster Management Plans (DDMP)",
    authority: "ASDMA",
    hazard: "Multi-Hazard",
    coverage: "District Administration",
    dataType: "PDF Document Audit",
    defaultStatus: "Update Required"
  },
  {
    key: "gsi_bhusanket",
    name: "GSI Landslide Hazard Susceptibility Zonation",
    authority: "GSI Bhusanket",
    hazard: "Landslide",
    coverage: "Hilly Terrain Grid",
    dataType: "GeoJSON / Shapefile",
    defaultStatus: "Unavailable"
  },
  {
    key: "bmtpc_earthquake",
    name: "BMTPC Vulnerability Atlas - Seismic Risk Zones",
    authority: "BMTPC",
    hazard: "Earthquake",
    coverage: "Seismic Zone V / National",
    dataType: "GeoJSON / Polygon Layers",
    defaultStatus: "Unavailable"
  },
  {
    key: "imd_warnings",
    name: "IMD Extreme Weather Alerts (Rain/Heat/Cyclone)",
    authority: "IMD",
    hazard: "Multi-Hazard",
    coverage: "National / State Subdivisions",
    dataType: "JSON Alerts Feed",
    defaultStatus: "Connected"
  },
  {
    key: "official_shelters",
    name: "Emergency Shelters Database",
    authority: "ASDMA",
    hazard: "Multi-Hazard",
    coverage: "State / District Level",
    dataType: "CSV / JSON / GeoJSON",
    defaultStatus: "Unavailable"
  }
];

export const parseSheltersDataset = (rawData, format) => {
  let parsedList = [];
  if (format === 'csv') {
    const rows = parseCSV(rawData);
    parsedList = rows.map((row, idx) => ({
      id: row.id || `shelter_${Date.now()}_${idx}`,
      name: row.name || `Unnamed Shelter ${idx}`,
      district: row.district || "Unassigned",
      state: row.state || "Assam",
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      shelterType: row.shelterType || "Relief Camp / Temporary Shelter",
      suitableFor: row.suitableFor || (row.shelterType === "Raised Platform" || row.shelterType === "Flood Shelter" ? "Flood" : "Other"),
      capacity: row.capacity ? (parseInt(row.capacity) || "Data Not Available") : "Data Not Available",
      sourceName: row.source || "ASDMA",
      sourceUrl: row.sourceUrl || "https://asdma.assam.gov.in",
      verifiedDate: row.verifiedDate || new Date().toISOString().split('T')[0]
    }));
  } else if (format === 'geojson' || format === 'json') {
    const parsedObj = JSON.parse(rawData);
    if (parsedObj.type === 'FeatureCollection') {
      parsedList = parsedObj.features.map((f, idx) => {
        const props = f.properties || {};
        const coords = f.geometry && f.geometry.coordinates ? f.geometry.coordinates : [0, 0];
        return {
          id: props.id || props.id === 0 ? String(props.id) : `shelter_${Date.now()}_${idx}`,
          name: props.name || props.shelter_name || `Unnamed Shelter ${idx}`,
          district: props.district || "Unassigned",
          state: props.state || "Assam",
          latitude: parseFloat(coords[1] || props.latitude),
          longitude: parseFloat(coords[0] || props.longitude),
          shelterType: props.shelterType || props.type || "Relief Camp / Temporary Shelter",
          suitableFor: props.suitableFor || "Other",
          capacity: props.capacity ? (parseInt(props.capacity) || "Data Not Available") : "Data Not Available",
          sourceName: props.source || props.sourceName || "ASDMA",
          sourceUrl: props.sourceUrl || "https://asdma.assam.gov.in",
          verifiedDate: props.verifiedDate || new Date().toISOString().split('T')[0]
        };
      });
    } else {
      const arr = Array.isArray(parsedObj) ? parsedObj : [parsedObj];
      parsedList = arr.map((item, idx) => ({
        id: item.id || `shelter_${Date.now()}_${idx}`,
        name: item.name || `Unnamed Shelter ${idx}`,
        district: item.district || "Unassigned",
        state: item.state || "Assam",
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        shelterType: item.shelterType || "Relief Camp / Temporary Shelter",
        suitableFor: item.suitableFor || "Other",
        capacity: item.capacity ? (parseInt(item.capacity) || "Data Not Available") : "Data Not Available",
        sourceName: item.sourceName || item.source || "ASDMA",
        sourceUrl: item.sourceUrl || "https://asdma.assam.gov.in",
        verifiedDate: item.verifiedDate || new Date().toISOString().split('T')[0]
      }));
    }
  }

  return parsedList.filter(s => !isNaN(s.latitude) && !isNaN(s.longitude));
};
