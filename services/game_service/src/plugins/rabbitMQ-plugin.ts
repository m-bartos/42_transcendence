import { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

import {sendGameEvent, setupGameEventsPublisher, initRabbitMQ} from "../services/rabbitMQ-extension.js";

declare module 'fastify' {
  interface FastifyInstance {
    sendGameEvent: (message: string) => Promise<void>;
  }
}

async function rabbitmqPlugin(fastify: FastifyInstance, opt: FastifyInstance): Promise<void> {
  initRabbitMQ();
  setupGameEventsPublisher();
  fastify.decorate('sendGameEvent', sendGameEvent);
}

export default fp(rabbitmqPlugin, {
  name: 'rabbitMQGlobalPlugin',
  fastify: '5.x'
})