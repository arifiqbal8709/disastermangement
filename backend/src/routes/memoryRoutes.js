import express from 'express';
import { SupabaseService } from '../services/supabaseService.js';

const router = express.Router();

/**
 * GET /api/memory
 * Search historical disaster memory, failure modes & lessons learned
 */
router.get('/', async (req, res, next) => {
  try {
    const { q, hazard } = req.query;
    let records = await SupabaseService.getDisasterMemory(q || null);
    
    if (hazard) {
      records = records.filter(r => r.disaster_type.toLowerCase() === hazard.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/memory/:district
 * Get specific disaster memory profile for a district
 */
router.get('/:district', async (req, res, next) => {
  try {
    const { district } = req.params;
    const records = await SupabaseService.getDisasterMemory(district);
    return res.status(200).json({
      success: true,
      district,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
});

export default router;
