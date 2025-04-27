export const enum GameEvents {
    // connection handler
    ConnectPlayer = 'ConnectPlayer',
    DisconnectPlayer = 'DisconnectPlayer',
    PlayerConnected = 'PlayerConnected',
    PlayerDisconnected = 'PlayerDisconnected',

    // physics engine
    PaddleBounce = 'PaddleBounce',
    Score = 'Score',

    // game
    GameStarted = 'GameStarted',
    GameEnded = 'GameEnded',
    ScoreAdded = 'ScoreAdded',
    MovePaddle = 'MovePaddle',

    Update = 'Update',
}