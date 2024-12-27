import { matches } from '../helpers/dataLoader.js';
export const getNextMatches = async (req, res) => {
    try {
        const team = req.params.team.toLowerCase();
        const modifiedMatches = matches.map(match => ({
             ...match,
              home_team: match.home_team.toLowerCase(),
              away_team: match.away_team.toLowerCase()
         }));
         const teamMatches = modifiedMatches.filter(match =>
            match.home_team.toLowerCase() === team || match.away_team.toLowerCase() === team
        );
          const nextMatches = teamMatches.filter(match => new Date(match.date) > new Date());
          res.json({ nextMatches: nextMatches.slice(0,5) });
    } catch (error) {
         console.error('Error in getNextMatches:', error, req.params.team, error);
            res.status(500).json({ error: error.message });
    }
};