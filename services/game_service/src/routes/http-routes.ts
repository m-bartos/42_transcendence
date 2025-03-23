import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fp from 'fastify-plugin';
import createGameHandler from '../handlers/create-game-handler.js'

import { createBodySchema } from './schemas/create-body.js';
import { createResponseSchema, responseError500Schema  } from './schemas/create-response.js';
import { getResponseSchema } from './schemas/get-response.js'

const httpRoutes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {

    fastify.addSchema(createBodySchema);
    fastify.addSchema(createResponseSchema);
    fastify.addSchema(responseError500Schema );

    // POST - create game
    // INTERNAL ONLY
    fastify.route({
        method: 'POST',
        url: '/games',
        handler: createGameHandler,
        schema: {
          body: fastify.getSchema('schema:game:create:body'),
          response: {
              201: fastify.getSchema('schema:game:create:response201'),
              500: fastify.getSchema('schema:game:response500')
          }
        }
    })

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
                    data: {games: fastify.gameManager.getGames()}
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
};

export default fp(httpRoutes, {
    name: 'gameRoutes',
    fastify: '5.x',
    decorators: {
        fastify: ['gameManager'] // this is checking that parent instance has the property set
    }
})