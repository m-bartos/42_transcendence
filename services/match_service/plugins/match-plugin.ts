// game-plugin.ts
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import * as matchManager from '../modules/matchManager.js';

declare module 'fastify' {
    interface FastifyInstance {
        matchManager: matchManager.MatchManager;
    }
}

const matchGlobalPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    // Decorate fastify with our game manager functions
    fastify.decorate('matchManager', matchManager);
};

export default fp(matchGlobalPlugin, {
    name: 'matchGlobalPlugin',
    fastify: '5.x'
})