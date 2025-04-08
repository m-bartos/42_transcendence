
import { Knex } from 'knex';
import { JwtPayload } from './utils/authenticate.js';

declare module 'fastify' {
    interface FastifyInstance {
        dbSqlite: Knex;
        dbPg: Knex;
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void | { status: string; message: string }>;
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        jwt_payload?: JwtPayload;
        session_id?: string;
    }
}