// game-plugin.ts
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import * as gameManager from '../modules/gameManager.js';

declare module 'fastify' {
    interface FastifyInstance {
        gameManager: gameManager.GameManager;
    }
}

const gameGlobalPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    // Decorate fastify with our game manager functions
    fastify.decorate('gameManager', gameManager);
};

export default fp(gameGlobalPlugin, {
    name: 'gameGlobalPlugin',
    fastify: '5.x'
})