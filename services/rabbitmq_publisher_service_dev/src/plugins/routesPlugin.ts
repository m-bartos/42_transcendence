import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fp from 'fastify-plugin'
import publishEndGameMultiplayer from "../handlers/publishEndGameToRabbitMultiplayer.js";
import publishEndGameSplitKeyboard from "../handlers/publishEndGameToRabbitSplitKeyboard.js";
const routesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {

    // Publish game.end.multi json to rabbit by REST
    const gameEndMulti = {
        url: '/emit/multiplayer',
        method: 'get',
        preHandler: fastify.authenticate,
        handler: publishEndGameMultiplayer,
    }

    const gameEndSplit = {
        url: '/emit/split',
        method: 'get',
        preHandler: fastify.authenticate,
        handler: publishEndGameSplitKeyboard,
    }

    fastify.route(gameEndMulti);
    fastify.route(gameEndSplit);
}

export default fp(routesPlugin);