import { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

import {sendGameEvent, setupGameEventsPublisher, initRabbitMQ, rabbit} from "../services/rabbitMQ-extension.js";
import {Connection} from "rabbitmq-client";

declare module 'fastify' {
  interface FastifyInstance {
    sendGameEvent: (message: string) => Promise<void>;
    rabbitMQ: Connection;
  }
}

async function rabbitmqPlugin(fastify: FastifyInstance, opt: FastifyInstance): Promise<void> {
  initRabbitMQ();
  setupGameEventsPublisher();
  fastify.decorate('sendGameEvent', sendGameEvent);
  fastify.decorate('rabbitMQ', rabbit);
}

export default fp(rabbitmqPlugin, {
  name: 'rabbitMQGlobalPlugin',
  fastify: '5.x'
})