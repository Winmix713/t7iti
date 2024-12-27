import express from 'express';
import { validateMatchesQuery } from '../middlewares/validateMatchesQuery.js';
import { modifyMatches } from '../middlewares/modifyMatches.js';
import { getMatches } from '../controllers/matchesController.js';

const router = express.Router();

router.get(
  '/api/matches',
  validateMatchesQuery,
  modifyMatches,
  getMatches
);

export default router;