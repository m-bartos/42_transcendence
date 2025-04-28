// game-plugin.ts
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import * as matchManager from '../services/match-manager.js';

declare module 'fastify' {
    interface FastifyInstance {
        matchManager: matchManager.MatchManager;
        deleteTimeoutedMatches: ReturnType<typeof setInterval>;
        broadcastState: ReturnType<typeof setInterval>;
        makeMatches: ReturnType<typeof setInterval>;
        // broadcastStateOfMatchmakingService: ReturnType<typeof setInterval>;
    }
}

const matchGlobalPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    // Decorate fastify with our game manager functions
    fastify.decorate('matchManager', matchManager);

    // Start periodic timeout check
    fastify.decorate('deleteTimeoutedMatches', setInterval(() => {
        fastify.matchManager.deleteTimeoutedMatches(fastify);
    }, 1800 * 1000));


    fastify.decorate('makeMatches', setInterval(() => {
        fastify.matchManager.createMatchesFromPlayerQueue();
    }, 1000))

    fastify.decorate('broadcastState', setInterval(() => {
        fastify.matchManager.broadcastStates();
    }, 500))

    // fastify.decorate('broadcastStateOfMatchmakingService', setInterval(() => {
    // 	fastify.matchManager.broadcastStateOfMatchmakingService();
    // }, 500))

    // Clean up on plugin close
    fastify.addHook('onClose', (instance, done) => {
        clearInterval(fastify.deleteTimeoutedMatches);
        fastify.matchManager.closeAllWebSockets();
        done()
    });
};

export default fp(matchGlobalPlugin, {
    name: 'matchGlobalPlugin',
    fastify: '5.x'
})