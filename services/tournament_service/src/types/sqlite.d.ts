export interface SQLiteError extends Error {
    errno?: number;
    code?: string;
}

export interface Sqlite3Error extends Error {
    code?: string
}