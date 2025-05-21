// game-plugin.ts
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import * as matchManagerUtils from '../services/match-manager.js';

declare module 'fastify' {
    interface FastifyInstance {
        matchManager: matchManagerUtils.MatchManager;
         broadcastState: ReturnType<typeof setInterval>;
    }
}

const matchGlobalPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    // Decorate fastify with our game manager functions
    fastify.decorate('matchManager', matchManagerUtils.matchManager);

    fastify.decorate('broadcastState', setInterval(() => {
        fastify.matchManager.broadcastStates();
    }, 1000))

    // Clean up on plugin close
    fastify.addHook('onClose', (instance, done) => {
        // clearInterval(fastify.deleteTimeoutedMatches);
        fastify.matchManager.closeAllWebSockets();
        done()
    });
};

export default fp(matchGlobalPlugin, {
    name: 'matchGlobalPlugin',
    fastify: '5.x'
})