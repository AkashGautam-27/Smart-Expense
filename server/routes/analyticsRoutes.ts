import { Router } from 'express';
import { getDashboardStats, getMonthlyReports } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardStats);
router.get('/monthly-reports', getMonthlyReports);

export default router;
