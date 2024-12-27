import express from 'express';
import { getNextMatches } from '../controllers/nextMatchesController.js';
import { modifyMatches } from '../middlewares/modifyMatches.js';
import { validateTeamParam } from '../middlewares/validateTeamParam.js';

const router = express.Router();

router.get('/api/next_matches/:team', validateTeamParam, modifyMatches, getNextMatches);

export default router;