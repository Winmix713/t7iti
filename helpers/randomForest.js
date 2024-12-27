import fs from 'fs/promises';
import { RandomForestClassifier } from 'ml-random-forest';
import { matches } from './dataLoader.js';
import { calculateFormIndex, calculateAverageGoals, calculateHeadToHeadStats, calculateBttsProbability, calculateExpectedGoals } from './calculations.js';
import { getTeamElo } from './elo.js';

const modelPath = 'randomForestModel.json';

export const trainRandomForestModel = async () => {
  console.log('Starting to train Random Forest model...');
  
  const trainingData = matches.filter(match => {
    // Filter out matches with undefined or null scores
    return match.score && match.score.home !== undefined && match.score.away !== undefined;
  }).map(match => {
    const homeTeamElo = getTeamElo(match.home_team, match.away_team, matches).homeWinProb;
    const awayTeamElo = getTeamElo(match.home_team, match.away_team, matches).awayWinProb;
    const homeStats = calculateAverageGoals([match]);
    const awayStats = calculateAverageGoals([match]);
    const headToHeadStats = calculateHeadToHeadStats([match]);
    
    return {
      features: [
        calculateFormIndex(matches, match.home_team),
        calculateFormIndex(matches, match.away_team),
        homeStats.average_home_goals,
        awayStats.average_away_goals,
        headToHeadStats.home_win_percentage,
        headToHeadStats.away_win_percentage,
        headToHeadStats.draw_percentage,
        homeTeamElo,
        awayTeamElo
      ],
      label: match.score.home > match.score.away ? 'home' : (match.score.home < match.score.away ? 'away' : 'draw')
    };
  });

  console.log(`Prepared ${trainingData.length} valid matches for training.`);

  const features = trainingData.map(item => item.features);
  const labels = trainingData.map(item => item.label);

  console.log('Features sample:', features.slice(0, 5));
  console.log('Labels sample:', labels.slice(0, 5));

  if (features.length > 0 && labels.length > 0) {
    console.log('Training Random Forest model...');
    const classifier = new RandomForestClassifier({ nEstimators: 100 });
    
    try {
      classifier.train(features, labels);
      console.log('Random Forest model trained successfully.');
      
      const modelJson = classifier.toJSON();
      await fs.writeFile(modelPath, JSON.stringify(modelJson));
      console.log('Random Forest model saved successfully.');
      
      return classifier;
    } catch (error) {
      console.error('Error during Random Forest training:', error);
      return null;
    }
  } else {
    console.log('No valid training data for Random Forest model');
    return null;
  }
};

export const loadRandomForestModel = async () => {
  try {
    const data = await fs.readFile(modelPath, 'utf-8');
    const modelJson = JSON.parse(data);
    const classifier = RandomForestClassifier.fromJSON(modelJson);
    console.log('Random Forest model loaded successfully');
    return classifier;
  } catch (error) {
    console.error('Error loading Random Forest model:', error);
    return await trainRandomForestModel();
  }
};

export const predictWithRandomForest = async (homeTeam, awayTeam, matches) => {
  const classifier = await loadRandomForestModel();
  if (!classifier) return {
    predictedWinner: "TBD",
    bttsProbability: 0,
    homeExpectedGoals: 0,
    awayExpectedGoals: 0
  };

  const homeTeamElo = getTeamElo(homeTeam, awayTeam, matches).homeWinProb;
  const awayTeamElo = getTeamElo(homeTeam, awayTeam, matches).awayWinProb;
  const homeStats = calculateAverageGoals(matches.filter(match => match.home_team.toLowerCase() === homeTeam.toLowerCase()));
  const awayStats = calculateAverageGoals(matches.filter(match => match.away_team.toLowerCase() === awayTeam.toLowerCase()));
  const headToHeadStats = calculateHeadToHeadStats(matches.filter(match => 
    (match.home_team.toLowerCase() === homeTeam.toLowerCase() && match.away_team.toLowerCase() === awayTeam.toLowerCase()) || 
    (match.home_team.toLowerCase() === awayTeam.toLowerCase() && match.away_team.toLowerCase() === homeTeam.toLowerCase())
  ));

  const features = [
    calculateFormIndex(matches, homeTeam),
    calculateFormIndex(matches, awayTeam),
    homeStats.average_home_goals,
    awayStats.average_away_goals,
    headToHeadStats.home_win_percentage,
    headToHeadStats.away_win_percentage,
    headToHeadStats.draw_percentage,
    homeTeamElo,
    awayTeamElo
  ];

  try {
    const prediction = classifier.predict([features]);
    const bttsProbability = calculateBttsProbability(homeTeam, awayTeam, matches);
    const homeExpectedGoals = calculateExpectedGoals(homeTeam, matches);
    const awayExpectedGoals = calculateExpectedGoals(awayTeam, matches);

    return {
      predictedWinner: prediction[0],
      bttsProbability,
      homeExpectedGoals,
      awayExpectedGoals
    };
  } catch (error) {
    console.error('Random Forest prediction error', error);
    return {
      predictedWinner: "TBD",
      bttsProbability: 0,
      homeExpectedGoals: 0,
      awayExpectedGoals: 0
    };
  }
};

