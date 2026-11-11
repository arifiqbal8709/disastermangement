import express from 'express';
import { IntelligenceService } from '../services/intelligenceService.js';
import { SupabaseService } from '../services/supabaseService.js';

const router = express.Router();

/**
 * POST /api/intelligence/risk-assessment
 * Generate AI Multi-Hazard Disaster Risk Intelligence Assessment
 */
router.post('/risk-assessment', async (req, res, next) => {
  try {
    const { districtId, hazardType } = req.body;
    if (!districtId) {
      return res.status(400).json({
        success: false,
        message: 'districtId is required for risk assessment.'
      });
    }

    const assessment = await IntelligenceService.assessRisk({
      districtId,
      hazardType: hazardType || 'Flood'
    });

    return res.status(200).json({
      success: true,
      message: 'AI Multi-Hazard Risk Intelligence assessed successfully.',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/intelligence/history
 * Retrieve past risk assessment evaluations
 */
router.get('/history', async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const history = await SupabaseService.getRiskAssessments(districtId || null);
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

export default router;

