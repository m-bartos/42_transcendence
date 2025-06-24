CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,

    status TEXT NOT NULL CHECK(status IN ('active', 'deactivated')),
    online_status TEXT NOT NULL CHECK(online_status IN ('offline', 'online')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, friend_id)
);
