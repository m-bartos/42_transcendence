// split keyboard

interface GameEndedRabbitEventSplit {
    event: string;
    gameId: string;
    timestamp: string;
    data: {
        gameId: string;
        gameType: string; // obsolete but leave for clarity
        principalId: string; // the one who was logged in and let the other players play
        endCondition: string;
        playerOne: {
            username: string; // username registered for the split keyboard
            id: number;
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
    notProvided = 'notProvided',
    error = 'error',
}

export interface GameEndedSqlModelSplit {
    game_id: string;
    game_mode: GameMode;
    end_reason: EndReason;
    principal_id: string;
    player_one_id: number;
    player_one_username: string;
    player_one_score: number;
    player_one_paddle_bounce: number;
    player_two_id: number;
    player_two_username: string;
    player_two_score: number;
    player_two_paddle_bounce: number;
    created_at: string;
    started_at: string;
    ended_at: string;
    duration_seconds: number;
    winner_id: number;
    loser_id: number;
    winner_username: string;
    loser_username: string;
}

const getLooserId = (playerOneId: number, playerTwoId: number, winnerId: number): number => {
    if (winnerId === 0) return 0;
    return playerOneId === winnerId ? playerTwoId : playerOneId;
}

function getWinnerUsername(playerOneId: number, playerTwoId: number, winnerId: number, playerOneUsername: string, playerTwoUsername: string): string
{
    const loserId = getLooserId(playerOneId, playerTwoId, winnerId);
    if (loserId === 0) return '';
    return playerTwoId === loserId ? playerOneUsername : playerTwoUsername;
}

function getLoserUsername(playerOneId: number, playerTwoId: number, winnerId: number, playerOneUsername: string, playerTwoUsername: string): string
{
    const loserId = getLooserId(playerOneId, playerTwoId, winnerId);
    if (loserId === 0) return '';
    return playerTwoId === loserId ? playerTwoUsername : playerOneUsername;
}


function toGameMode(value: string): GameMode {
    switch (value) {
        case 'multiplayer': return GameMode.multiplayer;
        case 'splitKeyboard': return GameMode.splitKeyboard;
        case 'tournament': return GameMode.tournament;
        default: return GameMode.splitKeyboard;
    }
}
function toEndReason(value: string) {
    switch (value) {
        case 'scoreLimit': return EndReason.scoreLimit;
        case 'timeout': return EndReason.timeout;
        case 'playerLeft': return EndReason.playerLeft;
        case 'error': return EndReason.error;
        default: return EndReason.notProvided;
    }
}

function parseGameEndedEventMessageSplit(message: string): GameEndedSqlModelSplit {
    const gameEndedRabbitEventSplit: GameEndedRabbitEventSplit = JSON.parse(message);
    return {
        game_id: gameEndedRabbitEventSplit.gameId,
        game_mode: toGameMode(gameEndedRabbitEventSplit.data.gameType),
        end_reason: toEndReason(gameEndedRabbitEventSplit.data.endCondition),
        principal_id: gameEndedRabbitEventSplit.data.principalId,
        player_one_id: gameEndedRabbitEventSplit.data.playerOne.id, // delete
        player_one_username: gameEndedRabbitEventSplit.data.playerOne.username,
        player_one_score: gameEndedRabbitEventSplit.data.playerOne.score,
        player_one_paddle_bounce: gameEndedRabbitEventSplit.data.playerOne.paddleBounce,
        player_two_id: gameEndedRabbitEventSplit.data.playerTwo.id, // delete
        player_two_username: gameEndedRabbitEventSplit.data.playerTwo.username,
        player_two_score: gameEndedRabbitEventSplit.data.playerTwo.score,
        player_two_paddle_bounce: gameEndedRabbitEventSplit.data.playerTwo.paddleBounce,
        created_at: gameEndedRabbitEventSplit.data.created,
        started_at: gameEndedRabbitEventSplit.data.started,
        ended_at: gameEndedRabbitEventSplit.data.ended,
        duration_seconds: gameEndedRabbitEventSplit.data.duration,
        winner_id: gameEndedRabbitEventSplit.data.winnerId, // delete
        loser_id: getLooserId(gameEndedRabbitEventSplit.data.playerOne.id, gameEndedRabbitEventSplit.data.playerTwo.id, gameEndedRabbitEventSplit.data.winnerId),  // delete
        winner_username: getWinnerUsername(gameEndedRabbitEventSplit.data.playerOne.id, gameEndedRabbitEventSplit.data.playerTwo.id, gameEndedRabbitEventSplit.data.winnerId,gameEndedRabbitEventSplit.data.playerOne.username, gameEndedRabbitEventSplit.data.playerTwo.username),
        loser_username: getLoserUsername(gameEndedRabbitEventSplit.data.playerOne.id, gameEndedRabbitEventSplit.data.playerTwo.id, gameEndedRabbitEventSplit.data.winnerId,gameEndedRabbitEventSplit.data.playerOne.username, gameEndedRabbitEventSplit.data.playerTwo.username)
    };
}

export default parseGameEndedEventMessageSplit;