import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';

interface JwtPayload {
    jti: string;
    iat: number;
    exp: number;
}

declare module 'fastify' {
    interface FastifyRequest {
        jwt_payload?: JwtPayload;
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
        const decoded: JwtPayload = await request.server.jwt.verify<JwtPayload>(token);
        request.jwt_payload = decoded;
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

async function authenticateWS(fastify: FastifyInstance, jwtToken: string): Promise<string> {
    try {
        const decoded: JwtPayload = fastify.jwt.verify<JwtPayload>(jwtToken);
        return decoded.jti; // return sessionId
    } catch (error) {
        throw new Error('Invalid or expired WebSocket token');
    }
}

export default authenticate;
export { authenticateWS };