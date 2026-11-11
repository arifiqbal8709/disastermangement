import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/shelters', ResourceController.getShelters);
router.post('/shelters/batch', requireAdminAuth, ResourceController.importSheltersBatch);
router.get('/sources', ResourceController.getDataSources);

export default router;
