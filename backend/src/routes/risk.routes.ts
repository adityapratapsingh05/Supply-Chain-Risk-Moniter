import { Router } from 'express';
import * as ctrl from '../controllers/risk.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/overall', ctrl.overallRisk);
router.get('/events', ctrl.listRiskEvents);
router.post('/events', requireRole('ADMIN', 'MANAGER'), ctrl.createRiskEvent);
router.get('/heatmap', ctrl.heatmapData);

export default router;
