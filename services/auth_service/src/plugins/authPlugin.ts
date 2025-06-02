import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import authenticate from "../utils/authenticate.js";

async function authPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    // Register JWT plugin with configuration
    fastify.register(import('@fastify/jwt'), {
        secret: 'my-super-secret-key', // Hardcoded for testing
        sign: {
            expiresIn: '15m' // Initial expiration: 1 hour
        }
    });

    fastify.decorate('authenticate', authenticate);
}

export default fp(authPlugin)