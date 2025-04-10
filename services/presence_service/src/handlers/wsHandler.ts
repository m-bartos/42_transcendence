import {FastifyRequest, FastifyInstance} from "fastify";
import {decryptUserId} from "../utils/secureUserId.js";
import type { WebSocket } from 'ws'
import type {JwtPayload} from "../utils/authenticate.js";
import {inspect} from "node:util";
import storage from '../appLogic/userSessionStorage.js'
interface QueryParamObject
{
    playerJWT: string
}

export async function wsHandler (this: FastifyInstance, ws: WebSocket, request: FastifyRequest) {
    // Validation extraction
    let userId = '';
    let sessionId = '';
    const { playerJWT } = request.query as QueryParamObject;
    if (!playerJWT)
    {
        ws.send(JSON.stringify({status: "error", message: "invalid query string"}))
        ws.close();
    }
    try
    {
        const decodedToken: JwtPayload = await request.server.jwt.verify<JwtPayload>(playerJWT);
        userId = decryptUserId(decodedToken.sub);
        sessionId = decodedToken.jti;
    }
    catch (error)
    {
        ws.send(JSON.stringify({status: "error", message: "invalid jwt payload"}))
        ws.close();
    }

    storage.addConnection(userId, sessionId, ws);
    // Message Router
    ws.on('message', async (msg: string) => {
        ws.send(JSON.stringify({userId: userId, sessionId: sessionId, storage: storage.getTotalUserStorageCount(), sessions: storage.getUserSessionCount(userId), ws: storage.getUserWebSocketCount(userId)}));
        const connections = storage.getUserWebSockets(userId, '');
        connections.forEach(connection => {
            if (ws !== connection) {
                connection.send(JSON.stringify(msg.toString()));
            }
        })

    });

    ws.on('close', () => {
        storage.removeWebSocket(ws)
        ws.close();
    });

    ws.on('error', (err: unknown) => {
        storage.removeWebSocket(ws)
        ws.close()
    });

}

/*
client -> many sessions -> each session has many websockets
 */