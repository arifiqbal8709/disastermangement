import { Router } from 'express';
import { ActionPlanController } from '../controllers/actionPlanController.js';

const router = Router();

router.get('/:districtId', ActionPlanController.getDistrictActionPlan);
router.get('/:districtId/:hazardType', ActionPlanController.getDistrictActionPlan);

export default router;
