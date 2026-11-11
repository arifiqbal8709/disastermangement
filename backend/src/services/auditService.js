import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const localAuditLogs = [];

export const AuditService = {
  log: async ({ userEmail = 'system', action, resourceType, resourceId = null, ipAddress = null, details = {} }) => {
    const entry = {
      user_email: userEmail,
      action,
      resource_type: resourceType,
      resource_id: String(resourceId || ''),
      ip_address: ipAddress,
      details,
      created_at: new Date().toISOString()
    };

    logger.info(`[AUDIT] ${userEmail} -> ${action} on ${resourceType}:${resourceId || ''}`, details);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('audit_logs').insert([entry]);
        if (error) throw error;
        return true;
      } catch (err) {
        logger.error('Failed to write audit log to Supabase:', { error: err.message });
      }
    }

    // Keep last 500 audit entries locally in memory
    localAuditLogs.unshift({ ...entry, id: `audit_${Date.now()}` });
    if (localAuditLogs.length > 500) localAuditLogs.pop();
    return true;
  },

  getRecentLogs: async (limit = 50) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && data) return data;
      } catch (err) {
        logger.error('Failed to read audit logs from Supabase:', { error: err.message });
      }
    }
    return localAuditLogs.slice(0, limit);
  }
};
