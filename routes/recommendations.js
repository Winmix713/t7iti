import express from 'express';
import { getRecommendations } from '../controllers/recommendationsController.js';
import { modifyMatches } from '../middlewares/modifyMatches.js';
import { validateRecommendationsQuery } from '../middlewares/validateRecommendationsQuery.js';

const router = express.Router();
router.get('/api/recommendations',validateRecommendationsQuery , modifyMatches, getRecommendations);
export default router;