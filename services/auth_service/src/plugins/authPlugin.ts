import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import authenticate from "../utils/authenticate.js";
import {applySecret} from "../utils/retrieveSecret.js";

const jwtSecret = applySecret("jwtSecret");

async function authPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    // Register JWT plugin with configuration
    fastify.register(import('@fastify/jwt'), {
        secret: jwtSecret!,
        sign: {
            expiresIn: '1h' // Initial expiration: 1 hour
        }
    });
    fastify.decorate('authenticate', authenticate);
}

export default fp(authPlugin)