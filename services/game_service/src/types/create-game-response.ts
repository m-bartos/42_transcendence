export interface CreateGameResponse {
    status: 'success' | 'error';
    message: string;
    data?: {
        gameId: string;
        created: string;
    }
}