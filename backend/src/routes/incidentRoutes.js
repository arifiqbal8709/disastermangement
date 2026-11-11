import { Router } from 'express';
import { IncidentController } from '../controllers/incidentController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', IncidentController.getAllIncidents);
router.post('/', requireAdminAuth, IncidentController.createIncident);

export default router;
