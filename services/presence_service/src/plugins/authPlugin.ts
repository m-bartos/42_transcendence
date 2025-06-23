import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import {applySecret} from "../utils/retrieveSecret.js";

const jwtSecret = applySecret("jwtSecret");
const jwtTokenExpiration = applySecret("jwtTokenExpiration");

async function authPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    // Register JWT plugin with configuration
    fastify.register(import('@fastify/jwt'), {
        secret: jwtSecret!, // Hardcoded for testing
        sign: {
            expiresIn: jwtTokenExpiration // Initial expiration: 1 hour
        }
    });
}

export default fp(authPlugin)