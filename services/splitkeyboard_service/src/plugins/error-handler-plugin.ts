import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

async function customErrorHandler(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.setErrorHandler((error, request, reply) => {
        if (error.validation) {
            return reply.status(400).send({
                status: 'error',
                message: error.message
            });
        }

        if (error.name === 'SyntaxError') {
            // Or you could check error.name === 'SyntaxError'
            return reply.status(400).send({
                status: 'error',
                message: error.message
            });
        }

        if (error.code ===  "FST_ERR_CTP_BODY_TOO_LARGE") {
            return reply.status(413).send({
                status: 'error',
                message: error.message
            });
        }

        // Let non-validation errors pass through or handle them as you like:
        reply.send(error);
    });
}

export default fp(customErrorHandler);