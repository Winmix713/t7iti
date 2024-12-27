import { query, validationResult } from 'express-validator';
export const validateMatchesQuery = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('page_size').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('date').optional().isISO8601({ strict: true }),
    query('both_teams_scored').optional().isBoolean().toBoolean(),
   query('home_team').optional().isString().trim().toLowerCase(),
  query('away_team').optional().isString().trim().toLowerCase(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];