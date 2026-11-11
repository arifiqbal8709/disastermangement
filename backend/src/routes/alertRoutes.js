import express from 'express';
import { SupabaseService } from '../services/supabaseService.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { auditLog } from '../services/auditService.js';

const router = express.Router();

/**
 * GET /api/alerts
 * Retrieve live CAP-compliant verified early warning disaster alerts
 */
router.get('/', async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const alerts = await SupabaseService.getAlerts(districtId);
    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/alerts
 * Broadcast a verified disaster alert (Admin Protected)
 */
router.post('/', verifyToken, requireRole(['admin', 'super_admin']), async (req, res, next) => {
  try {
    const {
      headline,
      event,
      severity,
      districtId,
      districtName,
      state,
      areaDescription,
      instruction,
      sourceAgency,
      bulletinUrl
    } = req.body;

    if (!headline || !event || !severity || !state || !sourceAgency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required alert fields (headline, event, severity, state, sourceAgency).'
      });
    }

    const createdAlert = await SupabaseService.broadcastAlert({
      headline,
      event,
      severity,
      district_id: districtId || null,
      district_name: districtName || null,
      state,
      area_description: areaDescription || '',
      instruction: instruction || 'Stay indoors and follow local authorities directives.',
      source_agency: sourceAgency,
      bulletin_url: bulletinUrl || '',
      created_by: req.user.id
    });

    await auditLog(req.user.email, 'BROADCAST_ALERT', 'ALERTS', {
      alertId: createdAlert.id,
      headline,
      severity
    });

    return res.status(201).json({
      success: true,
      message: 'Verified CAP disaster alert broadcast successfully.',
      data: createdAlert
    });
  } catch (error) {
    next(error);
  }
});

export default router;
