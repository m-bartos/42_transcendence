import {FastifyInstance, FastifyPluginOptions, FastifyReply} from "fastify";
import fp from 'fastify-plugin';
import authenticate, { authenticateWS } from "../modules/authenticate.js";

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void | { status: string; message: string }>;
        authenticateWS: (fastify: FastifyInstance, jwtToken: string) => Promise<string>;
    }
}

async function authPlugin(app: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    app.decorate('authenticate', authenticate);
    app.decorate('authenticateWS', authenticateWS);
}

export default fp(authPlugin)