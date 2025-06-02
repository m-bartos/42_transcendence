import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin';
import * as gameManager from '../services/game-manager.js';

const gamePlugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.addHook('onClose', (instance, done) => {
        console.log('Closing game plugin');
        gameManager.clearGameManager();
        done();
    });
};

export default fp(gamePlugin, {
    name: 'gamePlugin',
    fastify: '5.x'
})