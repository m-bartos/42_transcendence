import type { WebSocket } from "ws";
import type { UserConnection } from "./router.js";
// Currently the remove webSocket does more than one thing,
// remove the deletion as it will be done async later as part of client current connection instability check


class ConnectionStorage {

    private users: Map<string, Map<string, WebSocket[]>>;
    constructor() {
        this.users = new Map();
    }

    addConnection(userConnection: UserConnection) {
        const userId = userConnection.userId;
        const sessionId = userConnection.sessionId;
        const ws = userConnection.ws;

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

    getUserId(websocket: WebSocket): string {
        for (const [userId, sessions] of this.users.entries()) {
            for (const [sessionId, connections] of sessions.entries()) {
                const index = connections.indexOf(websocket);
                if (index !== -1) {
                    return userId;
                }
            }
        }
        return '';
    }

    getUserStatus(searchedUserId: string): boolean {
        for (const userId of this.users.keys())
        {
            if (userId === searchedUserId) {
                return true;
            }
        }
        return false;
    }

    // returns an array of websockets that belong to the user
    getUserWebSockets(userId: string, sessionId: string): WebSocket[] {
        if (!this.users.has(userId))
        {
            return [];
        }
        if (!sessionId)
        {
            const websockets: WebSocket[] = [];
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

    removeWebSocket(websocket: WebSocket): number {
        for (const [userId, sessions] of this.users.entries()) {
            for (const [sessionId, connections] of sessions.entries()) {
                const index = connections.indexOf(websocket);
                if (index !== -1) {
                    connections.splice(index, 1);
                    this.removeSessionIfEmpty(userId, sessionId);
                    this.removeUserIfEmpty(userId);
                    return 0;
                }
            }
        }
        return 1;
    }

    private removeSessionIfEmpty(userId: string, sessionId: string): void {
        const sessions = this.users.get(userId);
        if (!sessions) return;

        const connections = sessions.get(sessionId);
        if (connections && connections.length === 0) {
            sessions.delete(sessionId);
        }
    }

    private removeUserIfEmpty(userId: string): void {
        const sessions = this.users.get(userId);
        if (sessions && sessions.size === 0) {
            this.users.delete(userId);
        }
    }


    getAllUsers(): string[] {
        const userIds: string[] = [];
        for (const userId of this.users.keys()) {
            userIds.push(userId);
        }
        return userIds;
    }

    getAllUsersAndSessions(): object {
        const usersSessionsOnline = {}
        for (const [userId, sessions] of this.users.entries()) {
            // @ts-ignore
            usersSessionsOnline[userId] = Array.from(sessions.keys());
        }
        return usersSessionsOnline;
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

const storage = new ConnectionStorage();
export default storage;