import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {TournamentData, TournamentGameStatus, TournamentStatus} from "../types/tournament.js";

import {NotFoundError} from "../models/not-found-error.js";
import {getTournamentById} from "../utils/tournament-utils.js";
import {Sqlite3Error} from "../types/sqlite.js";


interface GetActiveTournamentParams {
    id: number;
}

interface GetTournamentResponse {
    status: 'success' | 'error';
    message: string;
    data?: TournamentData;
    conflict?: string;
}

interface TournamentStats {
    id: number;
    status: TournamentStatus;
    name: string;
    created: string;
    totalGames: number;
    gamesPlayed: number;
    gamesPending: number;
    playerRankings: Array<{
        username: string;
        wins: number;
        losses: number;
        winRate: number;
    }>;
}

export async function getStatsOfTournamentById(userId: number, tournamentId: number) {

    const tournamentData = await getTournamentById(userId, tournamentId, [TournamentStatus.Active, TournamentStatus.Finished]);
    console.log(tournamentData);

    const stats: TournamentStats = {
        id: tournamentData.id,
        status: tournamentData.status,
        name: tournamentData.name,
        created: tournamentData.created,
        totalGames: tournamentData.games.length,
        gamesPlayed: tournamentData.games.filter((game) => game.status === TournamentGameStatus.Finished).length,
        gamesPending: tournamentData.games.filter((game) => game.status !== TournamentGameStatus.Finished).length,
        playerRankings: [],
    }

    // Calculate player stats
    const playerStats: Record<string, { wins: number; losses: number }> = {};


    for (const game of tournamentData.games) {
        if (!playerStats[game.playerOneUsername]) {
            playerStats[game.playerOneUsername] = { wins: 0, losses: 0 };
        }

        if (!playerStats[game.playerTwoUsername]) {
            playerStats[game.playerTwoUsername] = { wins: 0, losses: 0 };
        }

        if (game.status === TournamentGameStatus.Finished && game.winnerUsername && game.loserUsername) {
            // Update wins and losses
            playerStats[game.winnerUsername].wins += 1;
            playerStats[game.loserUsername].losses += 1;
        }
    }


    // Convert to rankings array and calculate win rate
    stats.playerRankings = Object.entries(playerStats)
        .map(([username, { wins, losses }]) => ({
            username,
            wins,
            losses,
            winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0,
        }))
        .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate || b.losses - a.losses); // Sort by wins, then win rate



    return stats;
}

async function getStatsOfTournament(this: FastifyInstance, request: FastifyRequest<{Params: GetActiveTournamentParams}>, reply: FastifyReply): Promise<any> {
    try {
        const userId = request.userId;
        const tournamentId = request.params.id;

        if (!userId) {
            reply.code(500);
            return {status: 'error', message: 'internal server error'};
        }

        const data = await getStatsOfTournamentById(userId, tournamentId)

        reply.code(200);
        return {status: 'success', message: `Info for tournament id = ${tournamentId}.`, data};
    } catch (error: unknown) {
        // TODO: assign correct error messages
        if (error instanceof NotFoundError)
        {
            if (error.name === 'NotFoundError') {
                reply.code(400);
                return {status: 'error', message: error.message};
            }
        }
        else if (error instanceof Error) {
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

export default getStatsOfTournament;