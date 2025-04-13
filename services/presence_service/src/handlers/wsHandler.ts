import {FastifyRequest, FastifyInstance} from "fastify";
import {decryptUserId} from "../utils/secureUserId.js";
import type { WebSocket } from 'ws'
import type {JwtPayload} from "../utils/authenticate.js";
import {inspect} from "node:util";
import storage from '../appLogic/userSessionStorage.js'
import {Router} from "../appLogic/router.js";
import {ChatProtocol} from "../appLogic/handlers/chatProtocol.js";
import {HeartbeatProtocol} from "../appLogic/handlers/heartbeatProtocol.js";
const router = new Router();
new ChatProtocol(router);
new HeartbeatProtocol(router);

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
    const connection = {
        userId: userId,
        sessionId: sessionId,
        ws: ws,
    }
    // Message Router
    ws.on('message', async (msg: string) => {
        router.acceptMessage(msg, connection);
    });

    ws.on('close', () => {
        // Before removing the websocket, get its sessionId.
        // Remove it but do not delete the sessionId if the map is empty
        // Use async setTimeout and check if the sessionId has any websocket
        // if it does leave it, if it does not have, delete the sessionId (possible userId)
        // produce event to RabbitMq that the user sessionId is no longer valid
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