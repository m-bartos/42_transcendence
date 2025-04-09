import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import { rootHandler } from '../handlers/rootHandler.js'
import authenticate from "../utils/authenticate.js";
import {wsHttpHandler} from "../handlers/wsHttpHandler.js";
import { wsHandler } from "../handlers/wsHandler.js";

async function routePlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {

    const rootRoute = {
        url: '/',
        method: 'GET',
        preHandler: authenticate,
        handler: rootHandler
    }

    fastify.route(rootRoute);

    const wsRoute = {
        url: '/ws',
        method: 'GET',
        // preValidation: authenticate,
        preHandler: authenticate,
        handler: wsHttpHandler,
        wsHandler: wsHandler
    }

    fastify.route(wsRoute);
}

export default fp(routePlugin)