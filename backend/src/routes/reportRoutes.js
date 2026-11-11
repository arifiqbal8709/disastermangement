import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { uploadSinglePdf } from '../middleware/uploadMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/upload', uploadLimiter, uploadSinglePdf, ReportController.uploadAndAnalyze);
router.get('/', ReportController.getAllReports);

export default router;
