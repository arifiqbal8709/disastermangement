import { SupabaseService } from '../services/supabaseService.js';
import { ScoringService } from '../services/scoringService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const DistrictController = {
  getAllDistricts: async (req, res, next) => {
    try {
      const districts = await SupabaseService.getDistricts();
      return ApiResponse.success(res, districts, 'Districts retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  getDistrictById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const district = await SupabaseService.getDistrictById(id);

      if (!district) {
        return ApiResponse.error(res, `District with id '${id}' not found.`, 404);
      }

      // Fetch verified shelters for this district
      const shelters = await SupabaseService.getShelters(district.name);

      // Fetch historical incidents
      const incidents = await SupabaseService.getHistoricalIncidents({ district: district.name });

      // Determine default indicators for verified score calculation
      let indicators = null;
      if (id === 'dhemaji') {
        indicators = { warning: 80, shelter: 50, evacuation: 65, medical: 75 };
      } else if (id === 'cachar') {
        indicators = { warning: 85, shelter: 55, evacuation: 60, medical: 80 };
      } else if (id === 'kamrup_metropolitan') {
        indicators = { warning: 85, shelter: 60, evacuation: 70, medical: 80 };
      } else if (id === 'wayanad') {
        indicators = { warning: 70, shelter: 60, evacuation: 65, medical: 80 };
      } else if (id === 'chamoli') {
        indicators = { warning: 65, shelter: 50, evacuation: 55, medical: 70 };
      } else if (id === 'bhuj') {
        indicators = { warning: 60, shelter: 70, evacuation: 75, medical: 80 };
      }

      const scoreResult = indicators
        ? ScoringService.calculateScore(indicators)
        : ScoringService.calculateScore({ warning: null, shelter: null, evacuation: null, medical: null });

      return ApiResponse.success(res, {
        ...district,
        sheltersList: shelters,
        shelterCount: shelters.length,
        totalShelterCapacity: shelters.reduce((acc, s) => acc + (parseInt(s.capacity) || 0), 0),
        historicalIncidents: incidents,
        scoreDetails: scoreResult
      }, 'District intelligence retrieved.');
    } catch (err) {
      next(err);
    }
  },

  calculatePreparednessScore: (req, res) => {
    const { warning, shelter, evacuation, medical } = req.body;
    const result = ScoringService.calculateScore({
      warning: parseFloat(warning),
      shelter: parseFloat(shelter),
      evacuation: parseFloat(evacuation),
      medical: parseFloat(medical)
    });
    return ApiResponse.success(res, result, 'Preparedness score calculated deterministically.');
  }
};
