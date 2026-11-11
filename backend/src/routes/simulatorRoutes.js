import express from 'express';
import { SimulatorService } from '../services/simulatorService.js';
import { SupabaseService } from '../services/supabaseService.js';

const router = express.Router();

/**
 * POST /api/simulator/run
 * Execute a What-If Disaster Scenario Simulation
 */
router.post('/run', async (req, res, next) => {
  try {
    const {
      districtId,
      disasterType,
      rainfallSurgePct,
      damDischargeCumec,
      embankmentBreach,
      durationHours
    } = req.body;

    if (!districtId) {
      return res.status(400).json({
        success: false,
        message: 'districtId is required to run simulation.'
      });
    }

    const simulationResult = await SimulatorService.runScenario({
      districtId,
      disasterType: disasterType || 'Flood',
      rainfallSurgePct: parseInt(rainfallSurgePct) || 25,
      damDischargeCumec: parseInt(damDischargeCumec) || 0,
      embankmentBreach: Boolean(embankmentBreach),
      durationHours: parseInt(durationHours) || 24
    });

    return res.status(200).json({
      success: true,
      message: 'What-If Disaster Simulation executed successfully.',
      data: simulationResult
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/simulator/history
 * Retrieve simulation history for a district
 */
router.get('/history', async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const history = await SupabaseService.getScenarios(districtId || null);
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

