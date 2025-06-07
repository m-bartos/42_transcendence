
import { Knex } from 'knex';
import { JwtPayload } from './utils/authenticate.js';

declare module 'fastify' {
    interface FastifyInstance {
        dbSqlite: Knex;
        dbPg: Knex;
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void | { status: string; message: string }>;
        hashPassword: (password: string) => Promise<string>;
        comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
    }
}