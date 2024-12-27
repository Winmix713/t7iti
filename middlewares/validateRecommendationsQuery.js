import { query, validationResult } from 'express-validator';

export const validateRecommendationsQuery = [
  query('team').optional().isString().trim().toLowerCase(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];