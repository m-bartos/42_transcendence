import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import { getLastGamesRoute } from "../routes/getLastGamesRoute.js"

async function routePlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    fastify.route(getLastGamesRoute);
}

export default fp(routePlugin)