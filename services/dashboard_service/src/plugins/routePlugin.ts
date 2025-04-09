import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import { gamesWins } from "../routes/dashboardRoutes.js"

async function routePlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    fastify.route(gamesWins);
}

export default fp(routePlugin)