import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import authenticate from "../utils/authenticate.js";

async function authPlugin(app: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    app.decorate('authenticate', authenticate);
}

export default fp(authPlugin)