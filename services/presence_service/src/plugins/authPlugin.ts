import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';

async function authPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    // Register JWT plugin with configuration
    fastify.register(import('@fastify/jwt'), {
        secret: 'my-super-secret-key', // Hardcoded for testing
        sign: {
            expiresIn: '1h' // Initial expiration: 1 hour
        }
    });
}

export default fp(authPlugin)