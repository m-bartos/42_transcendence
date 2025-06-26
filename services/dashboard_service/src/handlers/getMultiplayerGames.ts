import type {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";
import {decryptUserId} from "../utils/secureUserId.js";

interface RequestBody {
    userId: string;
    pagination: {
        limit: number;
        offset: number;
    }
}

const requestBodySchema = {
    userId: "userId",
    pagination: {
        limit: "number",
        offset: "number"
    }
}

const responseData = {
    data: [],
    pagination: {}
}

interface Game {
    id: number,
    gameId: string,
    gameMode: string,
    endReason: string,
    playerOneId: number,
    playerOneUsername?: string,
    playerOneAvatar?: string | null,
    playerOneScore: number,
    playerOnePaddleBounce: number,
    playerTwoId: number,
    playerTwoUsername?: string,
    playerTwoAvatar?: string | null,
    playerTwoScore: number,
    playerTwoPaddleBounce: number,
    createdAt: number,
    startedAt: number,
    endedAt: number,
    durationSeconds: number,
    winnerId: number,
    loserId: number
}

interface AuthUserData {
    id:       number;
    username: string;
    avatar:   string | null;
}

const authServiceUrl = 'http://auth_service:3000/user/info';
const timer = 1000;

// Returns an array with user data from auth service is the form of id, username and avatar link
// Please mind that the id returned is the friend_id queried!!!
export async function fetchAuthServiceUserData(jwt: string, friendDbIds: number[]): Promise<AuthUserData[]>{
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timer); // 1 second timeout
    try {
        const response = await fetch(authServiceUrl, {
            signal: controller.signal,
            method: "POST",
            headers: {
                'Authorization': `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ friendDbIds: friendDbIds }),
        })
        clearTimeout(timeout);
        if (response.ok)
        {
            const { data } = await response.json();
            return data;
        }
        return [];
    } catch (error: any) {
        return [];
    }
}

async function addUserInfoToGames(games: Game[], jwt: string) {
    // Extract unique player IDs from games
    const playerIds = [...new Set([
        ...games.map(game => game.playerOneId),
        ...games.map(game => game.playerTwoId)
    ])];

    try {
        // Fetch user information
        const users = await fetchAuthServiceUserData(jwt, playerIds);

        // Create a map for quick user lookup
        const userMap = new Map(users.map(user => [user.id, user]));

        // Extend each game with user information
        games.forEach(game => {
            const playerOne = userMap.get(game.playerOneId);
            const playerTwo = userMap.get(game.playerTwoId);

            game.playerOneUsername = playerOne?.username || 'Unknown';
            game.playerOneAvatar = playerOne?.avatar || null;
            game.playerTwoUsername = playerTwo?.username || 'Unknown';
            game.playerTwoAvatar = playerTwo?.avatar || null;
        });

        return games;
    } catch (error) {
        console.error('Error fetching user info:', error);
        // Add default values in case of error
        games.forEach(game => {
            game.playerOneUsername = 'Unknown';
            game.playerOneAvatar = null;
            game.playerTwoUsername = 'Unknown';
            game.playerTwoAvatar = null;
        });
        return games;
    }
}

export async function getMultiplayerGames(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const {userId, pagination} = request.body as RequestBody;

    // transform to functions
    let limit = parseInt(pagination.limit.toString(), 10) || 20;
    let offset = parseInt(pagination.offset.toString(), 10) || 0;

    // transform to functions
    limit  = Math.min(Math.max(limit, 1), 100);
    offset = Math.max(offset, 0);

    try
    {
        // get number of records
        const result = await this.dbSqlite('multiplayer_results').where(function () {this.where('player_one_id', userId).orWhere('player_two_id', userId);}).count('* as count');
        const count = result[0].count;
        const total = Number(count);
        const games = await this.dbSqlite('multiplayer_results').select(
        'id as id',
        'game_id as gameId',
        'game_mode as gameMode',
        'end_reason as endReason',
        'player_one_id as playerOneId',
        'player_one_score as playerOneScore',
        'player_one_paddle_bounce as playerOnePaddleBounce',
        'player_two_id as playerTwoId',
        'player_two_score as playerTwoScore',
        'player_two_paddle_bounce as playerTwoPaddleBounce',
        'created_at as createdAt',
        'started_at as startedAt',
        'ended_at as endedAt',
        'duration_seconds as durationSeconds',
        'winner_id as winnerId',
        'loser_id as loserId'
        ).where({player_one_id: userId}).orWhere({player_two_id: userId}).orderBy('created_at', 'desc').limit(limit).offset(offset);
        const extendedGames = await addUserInfoToGames(games, request.jwt_payload?.token);

        // build pagination data - need to review this build function
        const hasPrev = offset > 0;
        const hasNext = offset + games.length < total;
        const prevOffset = hasPrev ? Math.max(offset - limit, 0) : 0;
        const nextOffset = hasNext ? offset + limit : offset;

        const responsePagination = {
            limit,
            offset,
            total,
            hasPrev,
            hasNext,
            prevOffset,
            nextOffset,
        }

        reply.code(200);
        return {status: "success", message: 'multiplayer games in descending order', data: {games: extendedGames, pagination: responsePagination}};

    }
    catch (error) {
        reply.code(500);
        return {status: 'error', message: error};
    }

}