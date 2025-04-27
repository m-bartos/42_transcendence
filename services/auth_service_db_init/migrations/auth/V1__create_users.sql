-- V1: Create users table
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     username TEXT NOT NULL,
                                     password TEXT NOT NULL,
                                     email TEXT NOT NULL,
                                     avatar TEXT,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     active BOOLEAN DEFAULT 1
);
