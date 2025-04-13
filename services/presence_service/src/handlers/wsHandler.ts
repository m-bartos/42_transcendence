import {FastifyRequest, FastifyInstance} from "fastify";
import {decryptUserId} from "../utils/secureUserId.js";
import type { WebSocket } from 'ws'
import type {JwtPayload} from "../utils/authenticate.js";
import type { UserConnection } from "../messageRouting/router.js";
import storage from '../messageRouting/connectionStorage.js'
import { Router } from "../messageRouting/router.js";
import { ChatProtocol } from "../messageRouting/protocols/chatProtocol.js";
import { HeartbeatProtocol } from "../messageRouting/protocols/heartbeatProtocol.js";
import { UserStatusProtocol } from "../messageRouting/protocols/userStatusProtocol.js";

const router = new Router();
new ChatProtocol(router);
new HeartbeatProtocol(router);
new UserStatusProtocol(router);

interface QueryParamObject
{
    playerJWT: string
}

export async function wsHandler (this: FastifyInstance, ws: WebSocket, request: FastifyRequest) {
    let connection: UserConnection = {
        userId: '',
        sessionId: '',
        ws: ws,
    }
    const { playerJWT } = request.query as QueryParamObject;
    if (!playerJWT)
    {
        ws.send(JSON.stringify({status: "error", message: "invalid query string"}))
        ws.close();
    }
    try
    {
        const decodedToken: JwtPayload = await request.server.jwt.verify<JwtPayload>(playerJWT);
        connection = {
            userId: decryptUserId(decodedToken.sub),
            sessionId: decodedToken.jti,
            ws: ws,
        }
    }
    catch (error)
    {
        ws.send(JSON.stringify({status: "error", message: "invalid jwt payload"}))
        ws.close();
    }

    storage.addConnection(connection);
    ws.on('message', async (msg: string) => {
        router.acceptMessage(msg, connection);
    });

    ws.on('close', () => {
        storage.removeWebSocket(ws);
        ws.close();
    });

    ws.on('error', (err: unknown) => {
        storage.removeWebSocket(ws)
        ws.close()
    });

}
