interface GameEndedRabbitEventMulti {
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

// tournament
interface GameEndedRabbitEventTournament {
    event: string; // added by rabbit lib - actually added by Martin!
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
    splitKeyboard = 'split_keyboard',
    tournament = 'tournament',
}

enum EndReason {
    scoreLimit = 'score_limit',
    timeout = 'timeout',
    playerLeft = 'player_left',
}

export interface GameEndedSqlModelMulti {
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
        case 'split_keyboard': return GameMode.splitKeyboard;
        case 'tournament': return GameMode.tournament;
        default: throw new Error(`Invalid game mode ${value}`);
    }
}

function toEndReason(value: string) {
    switch (value) {
        case 'score_limit': return EndReason.scoreLimit;
        case 'timeout': return EndReason.timeout;
        case 'player_left': return EndReason.playerLeft;
        default: throw new Error(`Invalid game end reason ${value}`);
    }
}


function parseGameEndedEventMessageMulti(message: string): GameEndedSqlModelMulti {
    // convert to JSON
    const gameEndedRabbitEventMulti: GameEndedRabbitEventMulti = JSON.parse(message);
    return {
        game_id: gameEndedRabbitEventMulti.gameId,
        game_mode: toGameMode(gameEndedRabbitEventMulti.data.gameType),
        end_reason: toEndReason(gameEndedRabbitEventMulti.data.endCondition),
        player_one_id: gameEndedRabbitEventMulti.data.playerOne.id,
        player_one_score: gameEndedRabbitEventMulti.data.playerOne.score,
        player_one_paddle_bounce: gameEndedRabbitEventMulti.data.playerOne.paddleBounce,
        player_two_id: gameEndedRabbitEventMulti.data.playerTwo.id,
        player_two_score: gameEndedRabbitEventMulti.data.playerTwo.score,
        player_two_paddle_bounce: gameEndedRabbitEventMulti.data.playerTwo.paddleBounce,
        created_at: gameEndedRabbitEventMulti.data.created,
        started_at: gameEndedRabbitEventMulti.data.started,
        ended_at: gameEndedRabbitEventMulti.data.ended,
        duration_seconds: gameEndedRabbitEventMulti.data.duration,
        winner_id: gameEndedRabbitEventMulti.data.winnerId,
        loser_id: getLooserId(gameEndedRabbitEventMulti.data.playerOne.id, gameEndedRabbitEventMulti.data.playerTwo.id, gameEndedRabbitEventMulti.data.winnerId)
    };
}

export default parseGameEndedEventMessageMulti;