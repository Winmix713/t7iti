import { matches } from '../helpers/dataLoader.js';
export const modifyMatches = (req, res, next) => {
  req.modifiedMatches =  matches.map(match => ({
    ...match,
    home_team: match.home_team.toLowerCase(),
    away_team: match.away_team.toLowerCase()
  }));
  next();
};