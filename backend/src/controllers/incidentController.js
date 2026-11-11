import { SupabaseService } from '../services/supabaseService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { historicalIncidentSchema } from '../validators/schemas.js';
import { AuditService } from '../services/auditService.js';

export const IncidentController = {
  getAllIncidents: async (req, res, next) => {
    try {
      const { district, disasterType, state } = req.query;
      const incidents = await SupabaseService.getHistoricalIncidents({ district, disasterType, state });
      return ApiResponse.success(res, incidents, 'Historical disaster incidents retrieved.');
    } catch (err) {
      next(err);
    }
  },

  createIncident: async (req, res, next) => {
    try {
      const parsed = historicalIncidentSchema.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponse.error(res, 'Validation failed', 400, parsed.error.format());
      }

      const created = await SupabaseService.createHistoricalIncident(parsed.data);

      await AuditService.log({
        userEmail: req.user ? req.user.email : 'admin',
        action: 'CREATE_HISTORICAL_INCIDENT',
        resourceType: 'HISTORICAL_INCIDENT',
        resourceId: created.id,
        ipAddress: req.ip,
        details: { name: created.name, district: created.district, year: created.incident_year }
      });

      return ApiResponse.success(res, created, 'Historical disaster incident registered.', 201);
    } catch (err) {
      next(err);
    }
  }
};
