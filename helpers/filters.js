export const filterMatches = (matches, params) => {
    return matches.filter(match => {
        for (const [key, value] of Object.entries(params)) {
            switch (key) {
                case 'team':
                    if (match.home_team.toLowerCase() !== value && match.away_team.toLowerCase() !== value) return false;
                    break;
                case 'home_team':
                    if (match.home_team.toLowerCase() !== value) return false;
                    break;
                case 'away_team':
                    if (match.away_team.toLowerCase() !== value) return false;
                    break;
                case 'date':
                   if (isNaN(new Date(value))) return false;
                  if (new Date(match.date) < new Date(value)) return false;
                   break;
                 case 'score_home':
                case 'score_away':
                    const scoreType = key.replace('score_', '');
                    if (match.score[scoreType].toString() !== value) return false;
                    break;
                case 'both_teams_scored':
                    if (value !== 'true' && value !== 'false') return false;
                    const bothScored = match.score.home > 0 && match.score.away > 0;
                    if (bothScored !== (value.toLowerCase() === 'true')) return false;
                    break;
                default:
                    if (match[key]?.toLowerCase() !== value) return false;
            }
        }
        return true;
    });
};