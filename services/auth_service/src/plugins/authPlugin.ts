import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import authenticate from "../utils/authenticate.js";

async function authPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    fastify.decorate('authenticate', authenticate);
}

export default fp(authPlugin)