DROP TABLE tournament_games;
CREATE TABLE IF NOT EXISTS tournament_games (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        tournament_id INTEGER NOT NULL,

                                        game_id TEXT NOT NULL,
                                        game_mode TEXT CHECK(game_mode IN ('splitkeyboard-tournament')) NOT NULL,
                                        end_reason TEXT CHECK(end_reason IN ('scoreLimit', 'timeout', 'playerLeft', 'error')) DEFAULT null,

--                                         principal_id INTEGER NOT NULL,

--                                         player_one_id INTEGER NOT NULL, -- not needed
                                        player_one_username TEXT NOT NULL, -- get when created
                                        player_one_score INTEGER DEFAULT 0, -- null by default?
                                        player_one_paddle_bounce INTEGER DEFAULT 0, -- null by default?

--                                         player_two_id INTEGER NOT NULL, -- not needed
                                        player_two_username TEXT NOT NULL,
                                        player_two_score INTEGER DEFAULT 0,
                                        player_two_paddle_bounce INTEGER DEFAULT 0,

                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        started_at TIMESTAMP,
                                        ended_at TIMESTAMP,
                                        duration INTEGER DEFAULT 0,

--                                         winner_id INTEGER,
--                                         loser_id INTEGER,
                                        winner_username TEXT,
                                        loser_username TEXT,

                                        status TEXT CHECK(status IN ('pending', 'live', 'finished'))
);
