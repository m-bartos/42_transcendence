import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import fp from 'fastify-plugin';
import { WsQuery } from "../types/websocket.js";


interface JwtPayload {
    jti: string;
    sub: string;
    iat: number;
    exp: number;
}

declare module 'fastify' {
    interface FastifyRequest {
        sessionId?: string;
        username?: string;
        userId?: string;
    }
}

interface UserInfoResponse {
    status: string;
    message: string;
    data: {
        username: string;
        id: number;
    }
}

async function authenticate(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
    {
        reply.code(401);
        return reply.send({status: 'error', message: 'missing or invalid authorization header'});
    }

    const token: string = authHeader.split(' ')[1];
    try {
        const decoded: JwtPayload = request.server.jwt.verify<JwtPayload>(token);
        request.sessionId = decoded.jti;
    } catch (error) {
        if (error instanceof Error)
        {
            reply.code(401);
            return reply.send({status: 'error', message: 'unauthorized'});
        }
        reply.code(500);
        return reply.send({status: 'error', message: 'internal server error'});
    }
}

async function getUserInfo(token: string): Promise<UserInfoResponse['data']> {
    const response = await fetch('http://auth_service:3000/user/info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
        throw new Error(`Auth service error: ${response.status}`);
    }
    const { data } = await response.json() as UserInfoResponse;
    return data;
}

async function authenticateWsPreHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { playerJWT } = request.query as WsQuery;
    if (!playerJWT)
    {
        reply.code(401);
        return reply.send({status: 'error', message: 'Missing authorization token'});
    }

    try {
        const decoded: JwtPayload = request.server.jwt.verify<JwtPayload>(playerJWT);
        request.sessionId = decoded.jti;
        request.userId = decoded.sub;
    }
    catch (error) {
        reply.code(401);
        return reply.send ({status: 'error', message: 'Invalid token'})
    }

    // TODO: does not need to abort when I do not get username from auth service
    try {
        const { username } = await getUserInfo(playerJWT)
        request.username = username;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            reply.code(503);
            return reply.send({status: 'error', message: 'Internal server error'})
        }
        reply.code(500);
        return reply.send({status: 'error', message: 'Internal server error'});
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void | { status: string; message: string }>;
        authenticateWsPreHandler: (request: FastifyRequest, reply: FastifyReply) => Promise<void | { status: string; message: string }>;
    }
}

async function authPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    await fastify.register(import('@fastify/jwt'), {
        secret: 'my-super-secret-key', // Hardcoded for testing
    });

    fastify.decorate('authenticate', authenticate);
    fastify.decorate('authenticateWsPreHandler', authenticateWsPreHandler);
}

export default fp(authPlugin)