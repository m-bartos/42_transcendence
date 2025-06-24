-- V4: Update snake case for checks in tables
DROP TABLE split_keyboard_results;
CREATE TABLE split_keyboard_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    game_mode TEXT CHECK(game_mode IN ('multiplayer', 'split_keyboard', 'tournament')) NOT NULL,
    end_reason TEXT CHECK(end_reason IN ('score_limit', 'timeout', 'player_left')) NOT NULL,

    principal_id TEXT NOT NULL,

    player_one_id INTEGER NOT NULL,
    player_one_username TEXT NOT NULL,
    player_one_score INTEGER DEFAULT 0,
    player_one_paddle_bounce INTEGER DEFAULT 0,

    player_two_id INTEGER NOT NULL,
    player_two_username TEXT NOT NULL,
    player_two_score INTEGER DEFAULT 0,
    player_two_paddle_bounce INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,

    winner_id INTEGER,
    loser_id INTEGER,
    winner_username TEXT,
    loser_username TEXT
    );

DROP TABLE multiplayer_results;
CREATE TABLE multiplayer_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    game_mode TEXT CHECK(game_mode IN ('multiplayer', 'split_keyboard', 'tournament')) NOT NULL,
    end_reason TEXT CHECK(end_reason IN ('score_limit', 'timeout', 'player_left')) NOT NULL,

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
