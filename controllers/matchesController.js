import { filterMatches } from '../helpers/filters.js';
import { calculateBothTeamsScoredPercentage, calculateAverageGoals, calculateFormIndex, calculateHeadToHeadStats, runPrediction } from '../helpers/calculations.js';
import { matches } from '../helpers/dataLoader.js'
export const getMatches = async (req, res) => {
    try {
        const params = Object.fromEntries(
            Object.entries(req.query)
                .filter(([_, value]) => value !== '')
                .map(([key, value]) => [key, value.toString().toLowerCase().trim()])
        );

        const filteredMatches = filterMatches(matches, params);
        filteredMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.max(1, parseInt(req.query.page_size) || 10);
        const totalMatches = filteredMatches.length;
        const offset = (page - 1) * pageSize;
        const paginatedMatches = filteredMatches.slice(offset, offset + pageSize);
        const homeTeam = params.home_team;
        const awayTeam = params.away_team;
        let teamAnalysis = null;
        let prediction = null;
        if (homeTeam && awayTeam) {
            const teamAnalysisMatches = filteredMatches.filter(match =>
                (match.home_team.toLowerCase() === homeTeam && match.away_team.toLowerCase() === awayTeam) ||
                (match.home_team.toLowerCase() === awayTeam && match.away_team.toLowerCase() === homeTeam)
            );
            teamAnalysis = {
                home_team: homeTeam,
                away_team: awayTeam,
                matches_count: teamAnalysisMatches.length,
                both_teams_scored_percentage: calculateBothTeamsScoredPercentage(teamAnalysisMatches),
                average_goals: calculateAverageGoals(teamAnalysisMatches),
                home_form_index: calculateFormIndex(filteredMatches, homeTeam),
                away_form_index: calculateFormIndex(filteredMatches, awayTeam),
                head_to_head_stats: calculateHeadToHeadStats(teamAnalysisMatches)
            };
            prediction = await runPrediction(homeTeam, awayTeam, filteredMatches);
        }
        res.json({
            total_matches: totalMatches,
            page,
            page_size: pageSize,
            matches: paginatedMatches,
            team_analysis: teamAnalysis,
            prediction
        });
    } catch (error) {
        console.error('Error in getMatches:', error, req.query);
        res.status(500).json({ error: error.message });
    }
};