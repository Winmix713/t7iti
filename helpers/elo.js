 let eloCache = {};
export const getTeamElo = (homeTeam, awayTeam, matches) => {
    const calculateEloProbabilities = (homeTeam, awayTeam, matches) => {
         const getTeamElo = (team) => {
             if (eloCache[team]) return eloCache[team];
                let teamElo = 1500;
                matches.forEach(match => {
                    const isHome = match.home_team.toLowerCase() === team.toLowerCase();
                    const opponent = isHome ? match.away_team : match.home_team;
                    const opponentElo = eloCache[opponent] ?? 1500;
                    const matchScore = isHome ? match.score.home - match.score.away : match.score.away - match.score.home;
                    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - teamElo) / 400));
                    const actualScore = matchScore > 0 ? 1 : (matchScore < 0 ? 0 : 0.5);
                    teamElo += 32 * (actualScore - expectedScore);
                });
                const roundedElo = Math.round(teamElo);
                eloCache[team] = roundedElo
                return roundedElo;
             };

            const homeTeamElo = getTeamElo(homeTeam);
            const awayTeamElo = getTeamElo(awayTeam);
            const expectedHomeWin = 1 / (1 + Math.pow(10, (awayTeamElo - homeTeamElo) / 400));
            const expectedAwayWin = 1 - expectedHomeWin;
            const drawProb = 1 - (expectedHomeWin + expectedAwayWin);

            return {
                homeWinProb: Number(expectedHomeWin.toFixed(2)),
                drawProb: Number(drawProb.toFixed(2)),
                awayWinProb: Number(expectedAwayWin.toFixed(2)),
            };
    };
    return calculateEloProbabilities(homeTeam, awayTeam, matches)
};