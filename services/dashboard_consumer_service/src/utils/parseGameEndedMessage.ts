interface GameEndedRabbitEvent {
    event: string; // added by rabbit lib
    gameId: string;
    timestamp: string;
    data: {
        gameId: string;
        gameType: string;
        endCondition: string;
        playerOne: {
            id: number;
            score: number;
            paddleBounce: number;
        };
        playerTwo: {
            id: number;
            score: number;
            paddleBounce: number;
        };
        created: string;
        started: string;
        ended: string;
        duration: number;
        winnerId: number;
    }
}
// split keyboard
interface GameEndedSingleRabbitEvent {
    event: string; // added by rabbit lib
    gameId: string;
    timestamp: string;
    data: {
        gameId: string;
        gameType: string; // obsolete as implicitly derived by the of event - but perhaps it may be used later
        principalId: string; // the one who was logged in and let the other players play
        endCondition: string;
        playerOne: {
            username: string; // username registered for the split keyboard
            id: number; // probably not needed but still maybe it had some internal usage
            score: number;
            paddleBounce: number;
        };
        playerTwo: {
            username: string;
            id: number;
            score: number;
            paddleBounce: number;
        };
        created: string;
        started: string;
        ended: string;
        duration: number;
        winnerUsername: number;
    }
}
// tournament
interface GameEndedTournamentRabbitEvent {
    event: string; // added by rabbit lib
    gameId: string;
    tournamentId: string;
    tournamentName: string;
    tournamentType: string;
    timestamp: string;
    data: {
        gameId: string;
        gameType: string;
        endCondition: string;
        playerOne: {
            id: number;
            score: number;
            paddleBounce: number;
        };
        playerTwo: {
            id: number;
            score: number;
            paddleBounce: number;
        };
        created: string;
        started: string;
        ended: string;
        duration: number;
        winnerId: number;
    }
}

enum GameMode {
    multiplayer = 'multiplayer',
    splitKeyboard = 'splitKeyboard',
    tournament = 'tournament',
}

enum EndReason {
    scoreLimit = 'scoreLimit',
    timeout = 'timeout',
    playerLeft = 'playerLeft',
}

// export interface GameEndedSqlModel {
//     gameId: string;
//     gameMode: GameMode;
//     endReason: EndReason;
//     playerOneId: number;
//     playerOneScore: number;
//     playerOnePaddleBounce: number;
//     playerTwoId: number;
//     playerTwoScore: number;
//     playerTwoPaddleBounce: number;
//     createdAt: string;
//     startedAt: string;
//     endedAt: string;
//     duration: number;
//     winnerId: number;
//     looserId: number;
// }

export interface GameEndedSqlModel {
    game_id: string;
    game_mode: GameMode;
    end_reason: EndReason;
    player_one_id: number;
    player_one_score: number;
    player_one_paddle_bounce: number;
    player_two_id: number;
    player_two_score: number;
    player_two_paddle_bounce: number;
    created_at: string;
    started_at: string;
    ended_at: string;
    duration_seconds: number;
    winner_id: number;
    loser_id: number;
}

const getLooserId = (playerOneId: number, playerTwoId: number, winnerId: number): number => {
    return playerOneId === winnerId ? playerTwoId : playerOneId;
}

function toGameMode(value: string) {
    switch (value) {
        case 'multiplayer': return GameMode.multiplayer;
        case 'splitKeyboard': return GameMode.splitKeyboard;
        case 'tournament': return GameMode.tournament;
        default: throw new Error(`Invalid game mode ${value}`);
    }
}

function toEndReason(value: string) {
    switch (value) {
        case 'scoreLimit': return EndReason.scoreLimit;
        case 'timeout': return EndReason.timeout;
        case 'playerLeft': return EndReason.playerLeft;
        default: throw new Error(`Invalid game end reason ${value}`);
    }
}

// function parseGameEndedEventMessage(message: string): GameEndedSqlModel
// {
//     // convert to JSON
//     const gameEndedRabbit: GameEndedRabbitEvent = JSON.parse(message);
//     return {
//         gameId: gameEndedRabbit.gameId,
//         gameMode: toGameMode(gameEndedRabbit.data.gameType),
//         endReason: toEndReason(gameEndedRabbit.data.endCondition),
//         playerOneId: gameEndedRabbit.data.playerOne.id,
//         playerOneScore: gameEndedRabbit.data.playerOne.score,
//         playerOnePaddleBounce: gameEndedRabbit.data.playerOne.paddleBounce,
//         playerTwoId: gameEndedRabbit.data.playerTwo.id,
//         playerTwoScore: gameEndedRabbit.data.playerTwo.score,
//         playerTwoPaddleBounce: gameEndedRabbit.data.playerTwo.paddleBounce,
//         createdAt: gameEndedRabbit.data.created,
//         startedAt: gameEndedRabbit.data.started,
//         endedAt: gameEndedRabbit.data.ended,
//         duration: gameEndedRabbit.data.duration,
//         winnerId: gameEndedRabbit.data.winnerId,
//         looserId: getLooserId(gameEndedRabbit.data.playerOne.id, gameEndedRabbit.data.playerTwo.id, gameEndedRabbit.data.winnerId)
//     }
// }

function parseGameEndedEventMessage(message: string): GameEndedSqlModel {
    // convert to JSON
    const gameEndedRabbit: GameEndedRabbitEvent = JSON.parse(message);
    return {
        game_id: gameEndedRabbit.gameId,
        game_mode: toGameMode(gameEndedRabbit.data.gameType),
        end_reason: toEndReason(gameEndedRabbit.data.endCondition),
        player_one_id: gameEndedRabbit.data.playerOne.id,
        player_one_score: gameEndedRabbit.data.playerOne.score,
        player_one_paddle_bounce: gameEndedRabbit.data.playerOne.paddleBounce,
        player_two_id: gameEndedRabbit.data.playerTwo.id,
        player_two_score: gameEndedRabbit.data.playerTwo.score,
        player_two_paddle_bounce: gameEndedRabbit.data.playerTwo.paddleBounce,
        created_at: gameEndedRabbit.data.created,
        started_at: gameEndedRabbit.data.started,
        ended_at: gameEndedRabbit.data.ended,
        duration_seconds: gameEndedRabbit.data.duration,
        winner_id: gameEndedRabbit.data.winnerId,
        loser_id: getLooserId(gameEndedRabbit.data.playerOne.id, gameEndedRabbit.data.playerTwo.id, gameEndedRabbit.data.winnerId)
    };
}

export default parseGameEndedEventMessage;