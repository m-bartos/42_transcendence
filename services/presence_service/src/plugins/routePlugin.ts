import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import authenticate from "../utils/authenticate.js";
import {wsHttpHandler} from "../handlers/wsHttpHandler.js";
import { wsHandler } from "../handlers/wsHandler.js";

async function routePlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {

    const wsRoute = {
        url: '/ws',
        method: 'GET',
        handler: wsHttpHandler,
        wsHandler: wsHandler
    }

    fastify.route(wsRoute);
}

export default fp(routePlugin)