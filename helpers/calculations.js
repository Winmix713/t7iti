import { getTeamElo } from "./elo.js";
import { predictWithRandomForest } from "./randomForest.js";
export const calculateBothTeamsScoredPercentage = (matches) => {
    const bothTeamsScoredCount = matches.reduce((count, match) =>
        count + (match.score.home > 0 && match.score.away > 0 ? 1 : 0), 0);
    return matches.length > 0 ? Number((bothTeamsScoredCount / matches.length * 100).toFixed(2)) : 0;
};
export const calculateAverageGoals = (matches) => {
    const totalGoals = matches.reduce((sum, match) => sum + match.score.home + match.score.away, 0);
    const homeGoals = matches.reduce((sum, match) => sum + match.score.home, 0);
    const awayGoals = matches.reduce((sum, match) => sum + match.score.away, 0);
    const totalMatches = matches.length;
    return {
        average_total_goals: totalMatches > 0 ? Number((totalGoals / totalMatches).toFixed(2)) : 0,
        average_home_goals: totalMatches > 0 ? Number((homeGoals / totalMatches).toFixed(2)) : 0,
        average_away_goals: totalMatches > 0 ? Number((awayGoals / totalMatches).toFixed(2)) : 0
    };
};
export const calculateFormIndex = (matches, team, recentGames = 5) => {
    const teamMatches = matches
        .filter(match => match.home_team.toLowerCase() === team.toLowerCase() || match.away_team.toLowerCase() === team.toLowerCase())
        .slice(0, recentGames);
    const points = teamMatches.reduce((sum, match) => {
        if (match.home_team.toLowerCase() === team.toLowerCase()) {
            if (match.score.home > match.score.away) return sum + 3;
            if (match.score.home === match.score.away) return sum + 1;
        } else {
            if (match.score.away > match.score.home) return sum + 3;
            if (match.score.away === match.score.home) return sum + 1;
        }
        return sum;
    }, 0);
    return recentGames > 0 ? Number((points / (recentGames * 3) * 100).toFixed(2)) : 0;
};
export const calculateHeadToHeadStats = (matches) => {
    let homeWins = 0, awayWins = 0, draws = 0;
    matches.forEach(match => {
        if (match.home_team.toLowerCase() === matches[0].home_team.toLowerCase() &&
            match.away_team.toLowerCase() === matches[0].away_team.toLowerCase()) {
            if (match.score.home > match.score.away) homeWins++;
            else if (match.score.home < match.score.away) awayWins++;
            else draws++;
        } else if (match.home_team.toLowerCase() === matches[0].away_team.toLowerCase() &&
                   match.away_team.toLowerCase() === matches[0].home_team.toLowerCase()) {
            if (match.score.home < match.score.away) homeWins++;
            else if (match.score.home > match.score.away) awayWins++;
            else draws++;
        }
    });
    const totalMatches = matches.length;
    return {
        home_wins: homeWins,
        away_wins: awayWins,
        draws: draws,
        home_win_percentage: totalMatches > 0 ? Number((homeWins / totalMatches * 100).toFixed(2)) : 0,
        away_win_percentage: totalMatches > 0 ? Number((awayWins / totalMatches * 100).toFixed(2)) : 0,
        draw_percentage: totalMatches > 0 ? Number((draws / totalMatches * 100).toFixed(2)) : 0
    };
};
export const calculateExpectedGoals = (team, matches) => {
  const teamMatches = matches.filter(match =>
      match.home_team.toLowerCase() === team.toLowerCase() || match.away_team.toLowerCase() === team.toLowerCase()
  );
  const totalGoals = teamMatches.reduce((sum, match) =>
      sum + (match.home_team.toLowerCase() === team.toLowerCase() ? match.score.home : match.score.away), 0
  );
  return teamMatches.length > 0 ? Number((totalGoals / teamMatches.length).toFixed(2)) : 0;
};
export const calculateBothTeamsToScoreProb = (matches) => {
  const bothScoredCount = matches.filter(match => match.score.home > 0 && match.score.away > 0).length;
  return matches.length > 0 ? Number((bothScoredCount / matches.length * 100).toFixed(2)) : 0;
};
export const predictWinner = (homeTeam, awayTeam, matches) => {
  let homeWins = 0, awayWins = 0, draws = 0;
  matches.forEach(match => {
    if (match.home_team.toLowerCase() === homeTeam.toLowerCase() && match.away_team.toLowerCase() === awayTeam.toLowerCase()) {
      if (match.score.home > match.score.away) homeWins++;
      else if (match.score.home < match.score.away) awayWins++;
      else draws++;
    } else if (match.home_team.toLowerCase() === awayTeam.toLowerCase() && match.away_team.toLowerCase() === homeTeam.toLowerCase()) {
      if (match.score.home < match.score.away) homeWins++;
      else if (match.score.home > match.score.away) awayWins++;
      else draws++;
    }
  });
  const totalMatches = homeWins + awayWins + draws;
  if (totalMatches === 0) return { winner: 'unknown', confidence: 0 };
  if (homeWins > awayWins) return { winner: 'home', confidence: Number((homeWins / totalMatches).toFixed(2)) };
  if (awayWins > homeWins) return { winner: 'away', confidence: Number((awayWins / totalMatches).toFixed(2)) };
  return { winner: 'draw', confidence: Number((draws / totalMatches).toFixed(2)) };
};
const getTeamStats = (team, matches) => {
  const teamMatches = matches.filter(match =>
      match.home_team.toLowerCase() === team.toLowerCase() || match.away_team.toLowerCase() === team.toLowerCase()
  );
  const goalsScored = teamMatches.reduce((sum, match) =>
      sum + (match.home_team.toLowerCase() === team.toLowerCase() ? match.score.home : match.score.away), 0
  );
  const goalsConceded = teamMatches.reduce((sum, match) =>
      sum + (match.home_team.toLowerCase() === team.toLowerCase() ? match.score.away : match.score.home), 0
  );
  return {
    avgGoalsScored: teamMatches.length > 0 ? Number((goalsScored / teamMatches.length).toFixed(2)) : 0,
    avgGoalsConceded: teamMatches.length > 0 ? Number((goalsConceded / teamMatches.length).toFixed(2)) : 0,
  };
};
const calculatePoisson = (homeGoals, awayGoals) => ({
  homeGoals: Math.round(homeGoals),
  awayGoals: Math.round(awayGoals),
});
export const calculateAttackingStrength = (team, matches) => {
    const teamMatches = matches.filter(match =>
        match.home_team.toLowerCase() === team.toLowerCase() || match.away_team.toLowerCase() === team.toLowerCase()
    );
    const homeMatches = teamMatches.filter(match => match.home_team.toLowerCase() === team.toLowerCase());
    const awayMatches = teamMatches.filter(match => match.away_team.toLowerCase() === team.toLowerCase());
    const avgGoalsScoredHome = homeMatches.length > 0 ? homeMatches.reduce((sum, match) => sum + match.score.home, 0) / homeMatches.length : 0;
    const avgGoalsScoredAway = awayMatches.length > 0 ? awayMatches.reduce((sum, match) => sum + match.score.away, 0) / awayMatches.length : 0;
   return {
      home: avgGoalsScoredHome,
       away: avgGoalsScoredAway
   }
}
export const calculateDefensiveStrength = (team, matches) => {
     const teamMatches = matches.filter(match =>
        match.home_team.toLowerCase() === team.toLowerCase() || match.away_team.toLowerCase() === team.toLowerCase()
    );
    const homeMatches = teamMatches.filter(match => match.home_team.toLowerCase() === team.toLowerCase());
    const awayMatches = teamMatches.filter(match => match.away_team.toLowerCase() === team.toLowerCase());
    const avgGoalsConcededHome = homeMatches.length > 0 ? homeMatches.reduce((sum, match) => sum + match.score.away, 0) / homeMatches.length : 0;
     const avgGoalsConcededAway = awayMatches.length > 0 ? awayMatches.reduce((sum, match) => sum + match.score.home, 0) / awayMatches.length : 0;
    return {
      home: avgGoalsConcededHome,
      away: avgGoalsConcededAway
    }
};
const poissonProbability = (lambda, k) => {
    return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
};
const factorial = (n) => {
    if (n === 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};
export const calculateBttsProbability = (homeTeam, awayTeam, matches) => {
    const homeAttack = calculateAttackingStrength(homeTeam, matches)
     const awayAttack = calculateAttackingStrength(awayTeam, matches)
     const homeDefense = calculateDefensiveStrength(homeTeam, matches)
    const awayDefense = calculateDefensiveStrength(awayTeam, matches)
  const homeExpectedGoals = (homeAttack.home + awayDefense.away)/2;
    const awayExpectedGoals = (awayAttack.away+ homeDefense.home)/2;
    let probability = 0;
    for (let i = 1; i <= 10; i++) {
        for (let j = 1; j <= 10; j++) {
          probability += (poissonProbability(homeExpectedGoals, i) * poissonProbability(awayExpectedGoals, j));
        }
    }
    return Number((probability * 100).toFixed(2));
};
export const runPrediction = async (homeTeam, awayTeam, matches) => {
  const homeStats = getTeamStats(homeTeam, matches);
  const awayStats = getTeamStats(awayTeam, matches);
  const homeAdvantage = 1.1;
  const predictedHomeGoals = (homeStats.avgGoalsScored * homeAdvantage + awayStats.avgGoalsConceded) / 2;
  const predictedAwayGoals = (awayStats.avgGoalsScored + homeStats.avgGoalsConceded) / 2;
     const randomForestPrediction =  await predictWithRandomForest(homeTeam, awayTeam, matches)
  return {
      homeExpectedGoals: randomForestPrediction.homeExpectedGoals,
    awayExpectedGoals: randomForestPrediction.awayExpectedGoals,
      bttsProbability : calculateBttsProbability(homeTeam, awayTeam,matches),
    predictedWinner: randomForestPrediction.predictedWinner,
      confidence: predictWinner(homeTeam, awayTeam, matches).confidence * 100,
    modelPredictions: {
      randomForest: randomForestPrediction.predictedWinner,
      poisson: calculatePoisson(predictedHomeGoals, predictedAwayGoals),
      elo: getTeamElo(homeTeam, awayTeam,matches),
    }
  };
};