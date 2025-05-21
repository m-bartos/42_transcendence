export const enum MatchmakingEvents {
    // connection handler
    PlayerAddedToQueue = 'playerAddedToQueue',
    PendingMatchReady = 'pendingMatchReady',
    PendingMatchTimeout = 'pendingMatchTimeout',
    PendingMatchRefused = 'pendingMatchRefused',
    GameCreated = 'gameCreated',
}