// Frontend API Client connecting to RESILIENCE AI Backend REST API

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('resilience_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data;
    },

    verify: async () => {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: { ...getAuthHeaders() }
      });
      return res.json();
    },

    logout: async () => {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { ...getAuthHeaders() }
        });
      } finally {
        localStorage.removeItem('resilience_admin_token');
        localStorage.removeItem('resilience_admin_user');
      }
    }
  },

  // Districts
  districts: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/districts`);
      const data = await res.json();
      return data.data || [];
    },

    getById: async (id) => {
      const res = await fetch(`${API_BASE}/districts/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch district');
      return data.data;
    },

    calculateScore: async (indicators) => {
      const res = await fetch(`${API_BASE}/districts/calculate-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(indicators)
      });
      const data = await res.json();
      return data.data;
    }
  },

  // Reports & AI Analysis
  reports: {
    uploadAndAnalyze: async (formData) => {
      const res = await fetch(`${API_BASE}/reports/upload`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
          // Do not set Content-Type header when sending FormData; browser sets it with boundary
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Report upload and analysis failed');
      return data.data;
    },

    getAll: async () => {
      const res = await fetch(`${API_BASE}/reports`);
      const data = await res.json();
      return data.data || [];
    }
  },

  // Historical Incidents
  incidents: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/incidents${query ? `?${query}` : ''}`);
      const data = await res.json();
      return data.data || [];
    },

    create: async (incidentData) => {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(incidentData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register historical incident');
      return data.data;
    }
  },

  // Resources & Shelters
  resources: {
    getShelters: async (district = '') => {
      const query = district ? `?district=${encodeURIComponent(district)}` : '';
      const res = await fetch(`${API_BASE}/resources/shelters${query}`);
      const data = await res.json();
      return data.data || [];
    },

    batchImportShelters: async (shelters) => {
      const res = await fetch(`${API_BASE}/resources/shelters/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ shelters })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to import shelters');
      return data.data;
    },

    getDataSources: async () => {
      const res = await fetch(`${API_BASE}/resources/sources`);
      const data = await res.json();
      return data.data || [];
    }
  },

  // Action Plans
  actionPlans: {
    getPlan: async (districtId, hazardType = 'Flood') => {
      const res = await fetch(`${API_BASE}/action-plans/${districtId}/${hazardType}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate action plan');
      return data.data;
    }
  },

  // Dashboard Stats
  stats: {
    getDashboardStats: async () => {
      const res = await fetch(`${API_BASE}/stats`);
      const data = await res.json();
      return data.data || {};
    }
  },

  // Live CAP Disaster Alerts (Feature 7)
  alerts: {
    getActive: async (districtId = '') => {
      const query = districtId ? `?districtId=${encodeURIComponent(districtId)}` : '';
      const res = await fetch(`${API_BASE}/alerts${query}`);
      const data = await res.json();
      return data.data || [];
    },

    broadcast: async (alertData) => {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(alertData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to broadcast alert');
      return data.data;
    }
  },

  // Historical Disaster Memory Engine (Feature 2)
  memory: {
    search: async (q = '', hazard = '') => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (hazard) params.set('hazard', hazard);
      const res = await fetch(`${API_BASE}/memory?${params.toString()}`);
      const data = await res.json();
      return data.data || [];
    },

    getDistrict: async (district) => {
      const res = await fetch(`${API_BASE}/memory/${encodeURIComponent(district)}`);
      const data = await res.json();
      return data.data || [];
    }
  },

  // What-If Disaster Scenario Simulator (Feature 4)
  simulator: {
    run: async (params) => {
      const res = await fetch(`${API_BASE}/simulator/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Simulation execution failed');
      return data.data;
    },

    getHistory: async (districtId = '') => {
      const query = districtId ? `?districtId=${encodeURIComponent(districtId)}` : '';
      const res = await fetch(`${API_BASE}/simulator/history${query}`);
      const data = await res.json();
      return data.data || [];
    }
  },

  // AI Disaster Risk Intelligence (Feature 1)
  intelligence: {
    assessRisk: async (districtId, hazardType = 'Flood') => {
      const res = await fetch(`${API_BASE}/intelligence/risk-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ districtId, hazardType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Risk assessment failed');
      return data.data;
    },

    getHistory: async (districtId = '') => {
      const query = districtId ? `?districtId=${encodeURIComponent(districtId)}` : '';
      const res = await fetch(`${API_BASE}/intelligence/history${query}`);
      const data = await res.json();
      return data.data || [];
    }
  }
};

