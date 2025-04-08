import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fp from 'fastify-plugin'
import publishEndGameToRabbit from "../handlers/publishEndGameToRabbit.js";
const routesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {

    // Publish game.end json to rabbit by REST
    const gameEnd = {
        url: '/emit/gameend',
        method: 'get',
        preHandler: fastify.authenticate,
        handler: publishEndGameToRabbit,
    }

    fastify.route(gameEnd);
}

export default fp(routesPlugin);