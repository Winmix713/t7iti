import fs from 'fs/promises';
export let matches = [];
export const loadMatches = async () => {
  try {
    const jsonData = await fs.readFile('combined_matches.json', 'utf8');
     const parsedData = JSON.parse(jsonData);
    matches = parsedData.matches || [];
    console.log('Matches loaded successfully.');
  } catch (error) {
    console.error('Error loading matches:', error);
  }
};