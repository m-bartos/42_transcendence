import type { WebSocket } from "ws";


class UserSessionStorage {

    private users: Map<string, Map<string, WebSocket[]>>;
    constructor() {
        this.users = new Map();
    }

    // this is correct - will always have these data when new ws connects
    addConnection(userId: string, sessionId: string, ws: WebSocket) {
        if (!this.users.has(userId)) {
            this.users.set(userId, new Map());
        }

        const userSessions = this.users.get(userId);

        if (!userSessions?.has(sessionId)) {
            userSessions?.set(sessionId, []);
        }

        const connections = userSessions?.get(sessionId);

        if (!connections?.includes(ws)) {
            connections?.push(ws);
        }
    }

    // returns an array of websockets that belong to the user
    getUserWebSockets(userId: string, sessionId: string) {
        if (!this.users.has(userId))
        {
            return [];
        }
        if (!sessionId)
        {
            const websockets = [];
            const sessions = this.users.get(userId);

            if (sessions)
            {
                for (const sessionId of sessions.values()) {
                    for (const ws of sessionId) {
                        websockets.push(ws);
                    }
                }
                return websockets;
            }
        }
        return this.users.get(userId)?.get(sessionId) || [];
    }

    // removes user from the users map
    removeUser(userId: string) {
        if (!this.users.has(userId)){
            this.users.delete(userId);
            return 0;
        }
        return 1;
    }


    // counting with a pair of information userId and sessionId come together
    // remove an array of all websocket connection that belong that that user session
    // and cleans up the user space
    removeSessionId(userId: string, sessionId: string) {
        if (!this.users.has(userId))
        {
            return 1;
        }
        const sessionIds = this.users.get(userId);
        if (!sessionIds?.has(sessionId))
        {
            return 1;
        }
        sessionIds.delete(sessionId)
        if (sessionIds.size === 0)
        {
            this.users.delete(userId);
        }
        return 0;
    }

    // finds and removes a websocket from within the whole user-session-websockets space
    // and cleans up
    removeWebSocket(websocket: WebSocket) {
        for (const [userId, sessions] of this.users.entries()) {
            for (const [sessionId, connections] of sessions.entries()) {
                const index = connections.indexOf(websocket);
                if (index !== -1) {
                    connections.splice(index, 1);

                    // Clean empty session
                    if (connections.length === 0) {
                        sessions.delete(sessionId);
                    }
                    // Clean empty user
                    if (sessions.size === 0) {
                        this.users.delete(userId);
                    }
                    return 0;
                }
            }
        }
        return 1;
    }

    removeConnection(userId: string, sessionId: string, ws: WebSocket) {
        const userSessions = this.users.get(userId);
        if (!userSessions) return;

        const connections = userSessions.get(sessionId);
        if (!connections) return;

        const index = connections.indexOf(ws);
        if (index !== -1) {
            connections.splice(index, 1);
        }

        if (connections.length === 0) {
            userSessions.delete(sessionId);
        }

        if (userSessions.size === 0) {
            this.users.delete(userId);
        }
    }

    getTotalUserStorageCount() {
        return this.users.size;
    }

    getUserSessionCount(userId: string): number {
        if (!this.users.has(userId))
        {
            return 0;
        }
        const userSessions = this.users.get(userId);
        if (!userSessions)
        {
            return 0;
        }
        return userSessions.size;
    }

    getUserWebSocketCount(userId: string): number {
        const userSessions = this.users.get(userId);
        if (!userSessions) {
            return 0;
        }

        let count = 0;
        for (const connections of userSessions.values()) {
            count += connections.length;
        }

        return count;
    }


    reset() {
        this.users.clear();
    }
}

const storage = new UserSessionStorage();
export default storage;