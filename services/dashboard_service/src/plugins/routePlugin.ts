import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import {gamesWins, getMultiGames} from "../routes/dashboardRoutes.js"

async function routePlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    fastify.route(gamesWins);
    fastify.route(getMultiGames)
}

export default fp(routePlugin)