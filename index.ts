import axios from 'axios';
import Twitter from 'twitter';
import dotenv from 'dotenv';

dotenv.config();

const footballApiKey = process.env.FOOTBALL_API_KEY!;
const twitterClient = new Twitter({
    consumer_key: process.env.CONSUMER_KEY!,
    consumer_secret: process.env.CONSUMER_SECRET!,
    access_token_key: process.env.ACCESS_TOKEN_KEY!,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET!
});

interface Match {
    id: number,
    homeTeam: { name: string },
    awayTeam: { name: string },
    score: {
        fullTime: {
            homeTeam: number,
            awayTeam: number
        }
    }
}

/**
 * Retrieves live match data from the football API.
 *
 * @return {Promise<Match[]>} An array of Match objects representing live matches.
 */
async function getLiveMatchData(): Promise<Match[]> {
    const response = await axios.get(
        'https://api.football-data.org/v2/matches', {
        headers: { 'X-Auth-Token': footballApiKey }
    });
    return response.data.matches;
}

/**
 * Sends a tweet with the given message using the Twitter API.
 *
 * @param {string} message - The message to be sent as a tweet.
 * @return {void} This function does not return anything.
 */
function tweet(message: string) {
    twitterClient.post('statuses/update', { status: message }, (error, tweet, response) => {
        if (!error) {
            console.log(tweet);
        } else {
            console.log(error);
        }
    })
}

/**
 * Monitors a specific match and tweets when goals are scored.
 *
 * @param {number} matchId - The ID of the match to monitor.
 * @return {Promise<void>} A promise that resolves when the monitoring is complete.
 */
async function monitorMatch(matchId: number): Promise<void> {
    let homeScore = 0;
    let awayScore = 0;

    const matches = await getLiveMatchData();
    const match = matches.find(m => m.id === matchId);
    console.log(matches)
    
    setInterval(async () => {
        const matches = await getLiveMatchData();
        const match = matches.find(m => m.id === matchId);
        console.log(matches)
        if (match) {
            if (match.score.fullTime.homeTeam > homeScore) {
                tweet(`Goal! ${match.homeTeam.name} scores!`);
                homeScore = match.score.fullTime.homeTeam;
            }

            if (match.score.fullTime.awayTeam > awayScore) {
                tweet(`Goal! ${match.awayTeam.name} scores!`);
                awayScore = match.score.fullTime.awayTeam;
            }
        }
    }, 60000);
}

const matchId = parseInt(process.env.MATCH_ID!, 10);
monitorMatch(matchId);