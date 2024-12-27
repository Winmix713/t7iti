export interface Score {
    home: number;
    away: number;
  }
  
  export interface Match {
    id: string;
    date: string;
    home_team: string;
    away_team: string;
    score: Score;
  }
  
  export interface TeamStats {
    avgGoalsScored: number;
    avgGoalsConceded: number;
  }
  
  export interface HeadToHeadStats {
    home_wins: number;
    away_wins: number;
    draws: number;
    home_win_percentage: number;
    away_win_percentage: number;
    draw_percentage: number;
  }
  
  export interface PredictionResult {
    winner: 'home' | 'away' | 'draw' | 'unknown';
    confidence: number;
  }
  
  export interface ModelPredictions {
    randomForest: string;
    poisson: {
      homeGoals: number;
      awayGoals: number;
    };
    elo: {
      homeWinProb: number;
      drawProb: number;
      awayWinProb: number;
    };
  }
  
  export interface Prediction {
    homeExpectedGoals: number;
    awayExpectedGoals: number;
      bttsProbability : number;
    predictedWinner: string;
    confidence: number;
    modelPredictions: ModelPredictions;
  }