import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fp from 'fastify-plugin';
import { gameManager } from "../services/game-manager.js";
import { getResponseSchema } from './schemas/get-response.js'
import {matchManager} from "../services/match-manager.js";

const httpRoutes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
    // GET - show all games
    // TESTING ONLY, NOT PRODUCTION
    fastify.addSchema(getResponseSchema);
    fastify.route({
        url: '/games',
        method: 'GET',
        // preHandler: fastify.authenticate,
        handler: async function (request: FastifyRequest, reply: FastifyReply) {
            try {
                return {
                    status: 'success',
                    data: {games: gameManager.getGames()}
                };
            } catch (error) {
                this.log.error(error)

                reply.code(500);
                return {
                    status: 'error',
                    error: {
                        code: 'GET_GAMES_FAILED'
                    }
                };
            }
        },
        schema: {
          response: {
            200: fastify.getSchema('schema:game:get:response200')
          }
        }
    })

    // GET - all players in queue
    // TESTING ONLY, NOT PRODUCTION
    // fastify.addSchema();
    fastify.route({
        url: '/players/queue',
        method: 'GET',
        // preHandler: fastify.authenticate,
        handler: async function (request: FastifyRequest, reply: FastifyReply) {
            try {
                return {
                    status: 'success',
                    data: {players: matchManager.getQueuedPlayers()}
                };
            } catch (error) {
                this.log.error(error);

                reply.code(500);
                return {
                    status: 'error',
                    error: {
                        code: 'GET_GAMES_FAILED'
                    }
                };
            }
        },
        // schema: {
        //     response: {
        //         200: fastify.getSchema('')
        //     }
        // }
    })


    // GET - all players in pending matches
    // TESTING ONLY, NOT PRODUCTION
    // fastify.addSchema();
    fastify.route({
        url: '/pendingMatches',
        method: 'GET',
        // preHandler: fastify.authenticate,
        handler: async function (request: FastifyRequest, reply: FastifyReply) {
            try {
                return {
                    status: 'success',
                    data: {matches: matchManager.getPendingMatches()}
                };
            } catch (error) {
                this.log.error(error);

                reply.code(500);
                return {
                    status: 'error',
                    error: {
                        code: 'GET_GAMES_FAILED'
                    }
                };
            }
        },

        // schema: {
        //     response: {
        //         200: fastify.getSchema('')
        //     }
        // }
    })


};

export default fp(httpRoutes, {
    name: 'gameRoutes',
    fastify: '5.x',
})