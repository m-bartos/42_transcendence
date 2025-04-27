-- V1: Create game_results table
CREATE TABLE IF NOT EXISTS game_results (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            game_id TEXT NOT NULL,
                                            game_mode TEXT CHECK(game_mode IN ('multiplayer', 'splitKeyboard', 'tournament')),
    end_reason TEXT CHECK(end_reason IN ('scoreLimit', 'timeout', 'playerLeft')),

    player_one_id INTEGER NOT NULL,
    player_one_score INTEGER DEFAULT 0,
    player_one_paddle_bounce INTEGER DEFAULT 0,

    player_two_id INTEGER NOT NULL,
    player_two_score INTEGER DEFAULT 0,
    player_two_paddle_bounce INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,

    winner_id INTEGER,
    loser_id INTEGER
    );
