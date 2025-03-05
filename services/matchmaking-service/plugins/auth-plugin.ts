import {FastifyInstance, FastifyPluginOptions, FastifyReply} from "fastify";
import fp from 'fastify-plugin';
import authenticate from "../modules/authenticate.js";
import * as gameManager from "../modules/gameManager.js";

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void | { status: string; message: string }>;
    }
}


async function authPlugin(app: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    app.decorate('authenticate', authenticate);
}

export default fp(authPlugin)