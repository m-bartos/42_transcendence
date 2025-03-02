-- V3: Drop table Users and create new with UNIQUE
DROP TABLE users;
CREATE TABLE users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     username TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     avatar TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     active BOOLEAN DEFAULT 1
);