import {FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply} from "fastify";
import fp from 'fastify-plugin';
import { WsQuery } from "../types/websocket.js";

interface JwtPayload {
    jti: string;
    iat: number;
    exp: number;
}

declare module 'fastify' {
    interface FastifyRequest {
        session_id?: string;
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
        request.session_id = decoded.jti;
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

async function authenticateWsPreHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.query )
    {
        reply.code(401);
        return reply.send({status: 'error', message: 'missing or invalid authorization header'});
    }

    const { playerJWT } = request.query as WsQuery;
    try {
        const decoded: JwtPayload = request.server.jwt.verify<JwtPayload>(playerJWT);
        request.session_id = decoded.jti;
    } catch (error) {
        if (error instanceof Error)
        {
            reply.code(401);
            return reply.send({status: 'error', message: 'unauthorized'});
        }
        reply.code(500);
        return reply.send({status: 'error', message: 'internal server error'});
    }
    console.log('test JWT')
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
        sign: {
            expiresIn: '1h' // Initial expiration: 1 hour
        }
    });

    fastify.decorate('authenticate', authenticate);
    fastify.decorate('authenticateWsPreHandler', authenticateWsPreHandler);
}

export default fp(authPlugin)