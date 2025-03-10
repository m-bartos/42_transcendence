import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import * as gameManager from '../services/game-manager.js';

declare module 'fastify' {
    interface FastifyInstance {
        gameManager: gameManager.GameManager;
        broadcastLiveGames: ReturnType<typeof setInterval>;
        broadcastPendingAndFinishedGames: ReturnType<typeof setInterval>;
        checkPendingGames: ReturnType<typeof setInterval>;
    }
}

const gamePlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.decorate('gameManager', gameManager);

    fastify.decorate('broadcastLiveGames', setInterval(() => {
        fastify.gameManager.broadcastLiveGames(fastify);
    }, 1000/60));

    fastify.decorate('broadcastPendingAndFinishedGames', setInterval(() => {
        fastify.gameManager.broadcastPendingAndFinishedGames(fastify);
    }, 500));

    fastify.decorate('checkPendingGames', setInterval(() => {
        fastify.gameManager.checkPendingGames(fastify);
    }, 1000));

    fastify.addHook('onClose', (instance, done) => {
        clearInterval(fastify.broadcastLiveGames);
        clearInterval(fastify.broadcastPendingAndFinishedGames);
        clearInterval(fastify.checkPendingGames);
        fastify.gameManager.closeAllWebSockets();
        done();
    });
};

export default fp(gamePlugin, {
    name: 'gamePlugin',
    fastify: '5.x'
})