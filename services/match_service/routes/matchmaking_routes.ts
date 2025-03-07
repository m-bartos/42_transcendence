import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fp from 'fastify-plugin';

// import { getPlayerQueueResponseSchema } from './schemas/get-response.js'

const matchmakingRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    // fastify.addSchema(getPlayerQueueResponseSchema);


    // GET - show all queued players
    fastify.route({
        method: 'GET',
        url: '/api/matchmaking/playersQueue',
        schema: {
          response: {
            // 201: fastify.getSchema('schema:matchmaking:playersQueue:get:response201')
          }
        },
        preHandler: fastify.authenticate,
        handler: async function (request: FastifyRequest, reply: FastifyReply) {
            try {
                return {
                    status: 'success',
                data: {players: fastify.matchManager.getQueuedPlayers()}
                };
            } catch (error) {
                this.log.error(error)
                
                reply.code(500);
                return {
                    status: 'error',
                    error: {
                        code: 'GET_PLAYERS_QUEUE_FAILED'
                    }
                };
            }
        }
    })

    // GET - show all games
    fastify.route({
        method: 'GET',
        url: '/api/matchmaking/matches',
        schema: {
            response: {
                // 201: fastify.getSchema('schema:matchmaking:playersQueue:get:response201')
            }
        },
        preHandler: fastify.authenticate,
        handler: async function (request: FastifyRequest, reply: FastifyReply) {
            try {
                return {
                    status: 'success',
                    data: {matches: fastify.matchManager.getMatches()}
                };
            } catch (error) {
                this.log.error(error)

                reply.code(500);
                return {
                    status: 'error',
                    error: {
                        code: 'GET_MATCHES_FAILED'
                    }
                };
            }
        }
    })


};

export default fp(matchmakingRoutes, {
    name: 'matchmakingRoutes',
    fastify: '5.x',
    decorators: {
        fastify: ['matchManager'] // this is checking that parent instance has the property set
    }
})