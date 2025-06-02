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
    game_id: string,
    game_mode: string,
    end_reason: string,
    player_one_id: number,
    player_one_username?: string,
    player_one_avatar?: string | null,
    player_one_score: number,
    player_one_paddle_bounce: number,
    player_two_id: number,
    player_two_username?: string,
    player_two_avatar?: string | null,
    player_two_score: number,
    player_two_paddle_bounce: number,
    created_at: number,
    started_at: number,
    ended_at: number,
    duration_seconds: number,
    winner_id: number,
    loser_id: number
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
        ...games.map(game => game.player_one_id),
        ...games.map(game => game.player_two_id)
    ])];

    try {
        // Fetch user information
        const users = await fetchAuthServiceUserData(jwt, playerIds);

        // Create a map for quick user lookup
        const userMap = new Map(users.map(user => [user.id, user]));

        // Extend each game with user information
        games.forEach(game => {
            const playerOne = userMap.get(game.player_one_id);
            const playerTwo = userMap.get(game.player_two_id);

            game.player_one_username = playerOne?.username || 'Unknown';
            game.player_one_avatar = playerOne?.avatar || null;
            game.player_two_username = playerTwo?.username || 'Unknown';
            game.player_two_avatar = playerTwo?.avatar || null;
        });

        return games;
    } catch (error) {
        console.error('Error fetching user info:', error);
        // Add default values in case of error
        games.forEach(game => {
            game.player_one_username = 'Unknown';
            game.player_one_avatar = null;
            game.player_two_username = 'Unknown';
            game.player_two_avatar = null;
        });
        return games;
    }
}

export async function getMultiplayerGames(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    // const encryptedUserId: string = request.jwt_payload.sub;
    // const authUserId: string = decryptUserId(encryptedUserId);
    const {userId, pagination} = request.body as RequestBody;
    console.log('User Id:',userId);
    console.log('Pagination:',pagination);

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
        'id',
        'game_id',
        'game_mode',
        'end_reason',
        'player_one_id',
        'player_one_score',
        'player_one_paddle_bounce',
        'player_two_id',
        'player_two_score',
        'player_two_paddle_bounce',
        'created_at',
        'started_at',
        'ended_at',
        'duration_seconds',
        'winner_id',
        'loser_id'
        ).where({player_one_id: userId}).orWhere({player_two_id: userId}).orderBy('created_at', 'desc').limit(limit).offset(offset);


        console.log(request.jwt_payload);
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