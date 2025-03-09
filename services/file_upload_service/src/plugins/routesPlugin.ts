import {FastifyInstance, FastifyPluginOptions} from 'fastify'
import fp from 'fastify-plugin'

export default fp(function async (fastify: FastifyInstance, opts: FastifyPluginOptions){
    fastify.route({
        url: '/index',
        method: 'get',
        preHandler: fastify.authenticate,
        handler: async (request, reply) => {
            reply.code(200);
            return {service_name: 'file_upload_service'};
        }
    })
})