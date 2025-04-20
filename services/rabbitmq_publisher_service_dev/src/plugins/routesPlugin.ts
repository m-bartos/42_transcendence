import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fp from 'fastify-plugin'
import publishEndGameMultiplayer from "../handlers/publishEndGameToRabbitMultiplayer.js";
const routesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {

    // Publish game.end.multi json to rabbit by REST
    const gameEnd = {
        url: '/emit/multiplayer',
        method: 'get',
        preHandler: fastify.authenticate,
        handler: publishEndGameMultiplayer,
    }

    fastify.route(gameEnd);
}

export default fp(routesPlugin);