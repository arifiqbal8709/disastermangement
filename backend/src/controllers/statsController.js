import { SupabaseService } from '../services/supabaseService.js';
import { AuditService } from '../services/auditService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const StatsController = {
  getDashboardStats: async (req, res, next) => {
    try {
      const stats = await SupabaseService.getSystemStats();
      const recentLogs = await AuditService.getRecentLogs(10);

      return ApiResponse.success(res, {
        ...stats,
        auditLogs: recentLogs,
        systemStatus: 'Operational',
        engineVersion: 'RESILIENCE AI v2.4 (Gemini Powered)'
      }, 'System statistics retrieved.');
    } catch (err) {
      next(err);
    }
  }
};

