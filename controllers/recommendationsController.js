import { filterMatches } from '../helpers/filters.js';
import { matches } from '../helpers/dataLoader.js';
export const getRecommendations = async (req, res) => {
    try {
        const params = Object.fromEntries(
            Object.entries(req.query)
                .filter(([_, value]) => value !== '')
                .map(([key, value]) => [key, value.toString().toLowerCase().trim()])
        );
          const modifiedMatches = matches.map(match => ({
             ...match,
              home_team: match.home_team.toLowerCase(),
              away_team: match.away_team.toLowerCase()
         }));
         const filteredMatches = filterMatches(modifiedMatches, params);
          if(params.team){
               const teamMatches = modifiedMatches.filter(match =>
                    match.home_team.toLowerCase() === params.team || match.away_team.toLowerCase() === params.team
                );
              const nextMatches = teamMatches.filter(match => new Date(match.date) > new Date());
              if(nextMatches.length > 0) {
                   res.json({ recommendations: nextMatches.slice(0,5)});
                   return;
                 }
            }
        res.json({ recommendations: filteredMatches.slice(0, 5) });
    } catch (error) {
        console.error('Error in getRecommendations:', error, req.query);
        res.status(500).json({ error: error.message });
    }
};