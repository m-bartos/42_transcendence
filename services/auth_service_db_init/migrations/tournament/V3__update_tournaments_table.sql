-- V3: update tournaments
DROP TABLE tournaments;
CREATE TABLE IF NOT EXISTS tournaments (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           name TEXT CHECK (length(name) <= 20),
                                           principal_id INTEGER NOT NULL,
                                           status TEXT CHECK (status IN ('active', 'finished', 'deleted')) NOT NULL,
                                           created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
