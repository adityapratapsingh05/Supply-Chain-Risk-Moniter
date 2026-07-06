import { Router } from 'express';
import * as ctrl from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/recommendations', ctrl.listRecommendations);
router.post('/mitigation', ctrl.generateMitigation);
router.post('/classify-news', ctrl.classifyNews);
router.post('/simulate', ctrl.runSimulation);
router.get('/executive-brief', ctrl.executiveBrief);
router.post('/score-node', ctrl.scoreNode);

export default router;
