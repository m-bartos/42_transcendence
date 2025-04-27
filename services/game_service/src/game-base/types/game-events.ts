export const enum GameEvents {

    // PhysicsEngine:
    PaddleBounce = 'PaddleBounce', // physics engine - emits, game - listens
    Score = 'Score', // physics engine - emits, game - listens

    // Game
    GameStarted = 'GameStarted', // game - emits, no one listens by default
    GameEnded = 'GameEnded', // game - emits, no one listens by default
    ScoreAdded = 'ScoreAdded', // game - emits, no one listens by default
    MovePaddle = 'MovePaddle', // game - emits, physics engine - listens

    GameState = 'GameState', // game - emits, no one listens by default
}