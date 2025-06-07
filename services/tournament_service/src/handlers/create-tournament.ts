import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {TournamentData, TournamentGame, TournamentGameStatus, TournamentStatus} from "../types/tournament.js";
import {getActiveTournamentById} from "./get-active-tournament.js";

interface CreateTournamentBody {
    name: string;
    usernames: string[];
}

interface CreateTournamentResponse {
    status: 'success' | 'error';
    message: string;
    data?: TournamentData;
    conflict?: string;
}

interface Sqlite3Error extends Error {
    code?: string
}

interface TournamentGameInsert {
    gameId: string;
    tournamentId?: number;
    status: TournamentGameStatus;
    endReason: string | null;
    playerOneUsername: string;
    playerOneScore: number;
    playerOnePaddleBounce: number;
    playerTwoUsername: string;
    playerTwoScore: number;
    playerTwoPaddleBounce: number;
    duration: number | null;
    winnerUsername: string | null;
    loserUsername: string | null;
}

function generateTournamentMatches(tournamentId: number, usernames: string[]): Array<TournamentGameInsert> {
    const games: Array<TournamentGameInsert> = [];

    // Iterate through all possible unique pairs
    for (let i = 0; i < usernames.length; i++) {
        for (let j = i + 1; j < usernames.length; j++) {
            const game: TournamentGameInsert = {
                gameId: crypto.randomUUID(),
                tournamentId: tournamentId,
                status: TournamentGameStatus.Pending,
                endReason: null,
                playerOneUsername: usernames[i],
                playerOneScore: 0,
                playerOnePaddleBounce: 0,
                playerTwoUsername: usernames[j],
                playerTwoScore: 0,
                playerTwoPaddleBounce: 0,
                winnerUsername: null,
                loserUsername: null,
                duration: null,
            };
            games.push(game);
        }
    }
    return games;
}

async function createTournament(this: FastifyInstance, request: FastifyRequest<{Body: CreateTournamentBody}>, reply: FastifyReply): Promise<CreateTournamentResponse> {
    try {
        const {name, usernames} = request.body;
        const userId = request.userId;

        if (!userId) {
            reply.code(500);
            return {status: 'error', message: 'internal server error'};
        }

        // Check unique usernames in body
        const uniqueUsernames = [...new Set(usernames)];
        if (uniqueUsernames.length !== usernames.length) {
            reply.code(409);
            return {
                status: 'error',
                message: 'Duplicate usernames are not allowed',
            };
        }

        const activeTournaments = await this.dbSqlite('tournaments')
            .select('name')
            .where({
                principal_id: userId,
                status: TournamentStatus.Active,
            });

        // Check if tournament name already exists
        const nameExists = activeTournaments.some(tournament => tournament.name === name);
        if (nameExists) {
            reply.code(409);
            return { status: 'error', message: 'Tournament name already exists', conflict: 'name' };
        }

        // Check active tournament count
        if (activeTournaments.length >= 5) {
            reply.code(400);
            return {
                status: 'error',
                message: 'Cannot create new match. More than 5 tournaments are not allowed. Delete or finish some tournaments.',
            };
        }

        // TODO: transaction
        const [tournamentId] = await this.dbSqlite('tournaments').insert({name: name, principal_id: userId, status: TournamentStatus.Active});
        const games = generateTournamentMatches(tournamentId, usernames);

        const gamesInsert = games.map((match) => ({
            tournament_id: match.tournamentId,
            game_id: match.gameId || '', // Ensure gameId is not undefined
            status: match.status,
            end_reason: null,
            game_mode: 'splitkeyboard-tournament',
            player_one_username: match.playerOneUsername,
            player_two_username: match.playerTwoUsername,
            player_one_score: match.playerOneScore,
            player_two_score: match.playerTwoScore,
            winner_username: match.winnerUsername,
            loser_username: match.loserUsername
        }));

        await this.dbSqlite('tournament_games').insert(gamesInsert);

        const data = await getActiveTournamentById(userId, tournamentId);

        reply.code(201);
        return {status: 'success', message: 'Tournament created successfully.', data};
    } catch (error: unknown) {
        // TODO: assign correct error messages
        if (error instanceof Error) {
            const sqliteError = error as Sqlite3Error; // Narrow to sqlite3 shape
            if (sqliteError.code === 'SQLITE_CONSTRAINT')
            {
                reply.code(400);
                return {status: 'error', message: sqliteError.message};
            } else {
                reply.code(500);
                return {status: 'error', message: sqliteError.message};
            }
        }
        reply.code(500);
        return {status: 'error', message: 'internal server error'};
    }
}

export default createTournament;