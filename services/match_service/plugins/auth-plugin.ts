import {FastifyInstance, FastifyPluginOptions, FastifyReply} from "fastify";
import fp from 'fastify-plugin';
import authenticate, { authenticateWsPreHandler } from "../modules/authenticate.js";

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void | { status: string; message: string }>;
        authenticateWsPreHandler: (request: FastifyRequest, reply: FastifyReply) => Promise<void | { status: string; message: string }>;
    }
}

async function authPlugin(app: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    app.decorate('authenticate', authenticate);
    app.decorate('authenticateWsPreHandler', authenticateWsPreHandler);
}

export default fp(authPlugin)