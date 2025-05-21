// game-plugin.ts
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import {matchManager} from "../services/match-manager.js";

const matchGlobalPlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    // Clean up on plugin close
    fastify.addHook('onClose', (instance, done) => {
        matchManager.closeAllWebSockets();
        done()
    });
};

export default fp(matchGlobalPlugin, {
    name: 'matchGlobalPlugin',
    fastify: '5.x'
})