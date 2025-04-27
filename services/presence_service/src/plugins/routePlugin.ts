import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import authenticate from "../utils/authenticate.js";
import {wsHttpHandler} from "../handlers/wsHttpHandler.js";
import { wsHandler } from "../handlers/wsHandler.js";

async function routePlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {

    const wsRoute = {
        url: '/ws',
        method: 'GET',
        preHandler: authenticate,
        handler: wsHttpHandler,
        wsHandler: wsHandler,
        schema: {
            response: {
                200: fastify.getSchema('https://ponggame.com/schemas/api/v1/presence/getOnlineUsers/response-200.json'),
                500: fastify.getSchema('https://ponggame.com/schemas/api/v1/presence/getOnlineUsers/response-500.json')
            }
        }
    }

    fastify.route(wsRoute);
}

export default fp(routePlugin)