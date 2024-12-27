import { param, validationResult } from 'express-validator';
export const validateTeamParam = [
  param('team').isString().trim().toLowerCase(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];