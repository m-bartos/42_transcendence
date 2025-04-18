export interface SQLiteError extends Error {
    errno?: number;
    code?: string;
}