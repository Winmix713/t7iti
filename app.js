import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import matchesRouter from './routes/matches.js';
import recommendationsRouter from './routes/recommendations.js';
import nextMatchesRouter from './routes/nextMatches.js';
import { loadMatches } from './helpers/dataLoader.js';
import { trainRandomForestModel } from './helpers/randomForest.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 request per IP
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Load matches at startup
loadMatches().then(async()=> {
     await trainRandomForestModel()
});
app.use(express.json());
// Routes
app.use(matchesRouter);
app.use(recommendationsRouter);
app.use(nextMatchesRouter);
// Swagger configuration
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Match API',
            version: '1.0.0',
            description: 'A simple API for fetching and analyzing match data.',
        },
    },
    apis: ['./src/routes/*.js', './src/app.js'], // Updated to include route files
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get a list of matches with optional filters and pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination.
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: The number of matches per page.
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *         description: Filter matches by team (home or away).
 *       - in: query
 *         name: home_team
 *         schema:
 *           type: string
 *         description: Filter matches by home team.
 *       - in: query
 *         name: away_team
 *         schema:
 *           type: string
 *         description: Filter matches by away team.
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter matches by date (YYYY-MM-DD) or later.
 *       - in: query
 *         name: score_home
 *         schema:
 *           type: string
 *         description: Filter matches by home team score.
 *       - in: query
 *         name: score_away
 *         schema:
 *           type: string
 *         description: Filter matches by away team score.
 *       - in: query
 *         name: both_teams_scored
 *         schema:
 *           type: string
 *         description: Filter matches by both teams scoring ('true' or 'false').
 *     responses:
 *       200:
 *         description: A successful response with a list of matches.
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "total_matches": 100,
 *                 "page": 1,
 *                 "page_size": 10,
 *                 "matches": [...],
 *                 "team_analysis": {},
 *                 "prediction": {}
 *               }
 *       400:
 *          description: Bad request, invalid query parameters.
 *       500:
 *          description: Internal server error.
 */
  /**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get match recommendations based on query parameters
 *     parameters:
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *         description: Recommend matches based on this team.
 *       - in: query
 *         name: home_team
 *         schema:
 *           type: string
 *         description: Recommend matches based on this home team.
 *       - in: query
 *         name: away_team
 *         schema:
 *           type: string
 *         description: Recommend matches based on this away team.
  *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter matches by date (YYYY-MM-DD) or later.
 *       - in: query
 *         name: score_home
 *         schema:
 *           type: string
 *         description: Filter matches by home team score.
 *       - in: query
 *         name: score_away
 *         schema:
 *           type: string
 *         description: Filter matches by away team score.
 *       - in: query
 *         name: both_teams_scored
 *         schema:
 *           type: string
 *         description: Filter matches by both teams scoring ('true' or 'false').
 *     responses:
 *       200:
 *         description: A successful response with a list of recommended matches
 *       500:
 *          description: Internal server error.
 */
/**
 * @swagger
 * /api/next_matches/{team}:
 *   get:
 *     summary: Get the next matches for a specific team.
 *     parameters:
 *       - in: path
 *         name: team
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the team for which to fetch the next matches.
 *     responses:
 *       200:
 *         description: A successful response with a list of next matches.
 *       500:
 *         description: Internal server error.
 */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});