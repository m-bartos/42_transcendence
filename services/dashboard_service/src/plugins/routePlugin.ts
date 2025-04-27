import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import { getSplitGames, getMultiGames } from "../routes/dashboardRoutes.js"

async function routePlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    fastify.route(getMultiGames)
    fastify.route(getSplitGames);
}

export default fp(routePlugin)