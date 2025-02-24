import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fp from 'fastify-plugin';
import { CreateGameBody } from '../../types/game.js';

import { createBodySchema } from './schemas/create-body.js';
import { createResponseSchema } from './schemas/create-response.js';

const gameRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    fastify.addSchema(createBodySchema);
    fastify.addSchema(createResponseSchema);

    // POST - create game
    fastify.route({
        method: 'POST',
        url: '/api/games',
        schema: {
          body: fastify.getSchema('schema:game:create:body'),
          response: {
            201: fastify.getSchema('schema:game:create:response201')
          }
        },
        handler: async function (request: FastifyRequest<{Body: CreateGameBody}>, reply: FastifyReply) {
            try {
                const game = fastify.gameManager.createGame(request.body.player1_id, request.body.player2_id)
    
                this.log.debug('Game created: ');
                this.log.debug(this.gameManager.getGame(game.id));
                return {
                    status: 'success',
                    data: {
                        game_id: game.id,
                        created_at: game.created.toISOString()
                    }
                };
            } catch (error) {
                this.log.error(error)
                
                reply.code(500);
                return {
                    status: 'error',
                    error: {
                        code: 'GAME_CREATION_FAILED'
                    }
                };
            }
        }
    })


};

export default fp(gameRoutes, {
    name: 'gameRoutes',
    fastify: '5.x',
    decorators: {
        fastify: ['gameManager'] // this is checking that parent instance has the property set
    }
})