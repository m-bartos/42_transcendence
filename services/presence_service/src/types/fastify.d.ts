import { Knex } from 'knex';
import { JwtPayload } from './utils/authenticate.js';

declare module 'fastify' {
    interface FastifyInstance {
        dbSqlite: Knex;
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        jwt_payload?: JwtPayload;
        session_id?: string;
    }
}