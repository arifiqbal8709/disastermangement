import { SupabaseService } from '../services/supabaseService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuditService } from '../services/auditService.js';

export const ResourceController = {
  getShelters: async (req, res, next) => {
    try {
      const { district } = req.query;
      const shelters = await SupabaseService.getShelters(district);
      return ApiResponse.success(res, shelters, 'Shelters retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },

  importSheltersBatch: async (req, res, next) => {
    try {
      const { shelters } = req.body;
      if (!Array.isArray(shelters) || shelters.length === 0) {
        return ApiResponse.error(res, 'Invalid payload. An array of shelter objects is required.', 400);
      }

      const imported = await SupabaseService.createSheltersBatch(shelters);

      await AuditService.log({
        userEmail: req.user ? req.user.email : 'admin',
        action: 'BATCH_IMPORT_SHELTERS',
        resourceType: 'SHELTERS',
        resourceId: `${shelters.length} items`,
        ipAddress: req.ip,
        details: { count: shelters.length }
      });

      return ApiResponse.success(res, imported, `Successfully registered ${shelters.length} emergency shelters.`, 201);
    } catch (err) {
      next(err);
    }
  },

  getDataSources: async (req, res, next) => {
    try {
      const sources = await SupabaseService.getDataSources();
      return ApiResponse.success(res, sources, 'Official data source registries retrieved.');
    } catch (err) {
      next(err);
    }
  }
};
