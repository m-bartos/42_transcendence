import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
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
}

export default authenticate;
export { authenticateWsPreHandler };