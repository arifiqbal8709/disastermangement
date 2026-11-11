import { Router } from 'express';
import { DistrictController } from '../controllers/districtController.js';

const router = Router();

router.get('/', DistrictController.getAllDistricts);
router.get('/:id', DistrictController.getDistrictById);
router.post('/calculate-score', DistrictController.calculatePreparednessScore);

export default router;

