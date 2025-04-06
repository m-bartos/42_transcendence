import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fp from 'fastify-plugin'
import publishEndGameToRabbit from "../handlers/publishEndGameToRabbit.js";
const routesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {

    const getAllGames = {
        // get all played games of a player
        url: '/pub',
        method: 'get',
        preHandler: fastify.authenticate,
        handler: publishEndGameToRabbit,
        // schema: {
        // // body: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/body.json'),
        // //     response: {
        // //     201: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/response-201.json'),
        // //         409: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/response-409.json'),
        // //         500: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/response-500.json'),
        // // }
        // }
    }

    fastify.route(getAllGames);
}

export default fp(routesPlugin);