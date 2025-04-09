import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

import {setupGameEventsConsumer, initRabbitMQ, rabbit} from "../services/rabbitMQ-extension.js";
import {Connection} from "rabbitmq-client";

declare module 'fastify' {
  interface FastifyInstance {
    rabbitMQ: Connection;
  }
}

async function rabbitmqPlugin(fastify: FastifyInstance, opt: FastifyPluginOptions): Promise<void> {
  initRabbitMQ();
  //setupGameEventsConsumer();
  fastify.decorate('rabbitMQ', rabbit);
}

export default fp(rabbitmqPlugin, {
  name: 'rabbitMQGlobalPlugin',
  fastify: '5.x'
})