-- V4: add linked users table
CREATE TABLE IF NOT EXISTS tournament_linked_users (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           tournament_id INTEGER NOT NULL,
                                           user_id INTEGER NOT NULL,
                                           alias TEXT NOT NULL,
                                           created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );