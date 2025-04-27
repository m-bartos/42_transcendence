import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

import {Connection, ConnectionOptions} from "rabbitmq-client";
import {initRabbitMQ} from "../services/rabbitMQ-initializer.js";
import {createPublisher} from "../services/rabbitMQ-publisher.js";

const gameRoutingKeys = ['game.start.multi', 'game.end.multi'] as const;
export type GameEventsPublisher = { sendEvent: (routingKey: typeof gameRoutingKeys[number], message: string) => void }


declare module 'fastify' {
  interface FastifyInstance {
    gameEventsPublisher: GameEventsPublisher;
    rabbitMQ: Connection;
  }
}

async function rabbitmqPlugin(fastify: FastifyInstance, opt: FastifyPluginOptions): Promise<void> {
  const connectionConfig: ConnectionOptions =
      {
        // have not tested the env! Could be also done as input parameters from fastify
        username: process.env.rabbitmq_username || 'game_service',
        password: process.env.rabbitmq_password || 'gamepass',
        hostname: process.env.rabbitmq_hostname || 'rabbitmq_service',
        port: process.env.rabbitmq_port || '5672',
        connectionName: process.env.rabbitmq_connection_name || 'game-publisher-service-connection',  // have not tested the env
        retryLow: 1000, // does not work, I still got default values of the rabbitmq-client, bug in rabbitmq-client?
        retryHigh: 5000, // does not work, I still got default values of the rabbitmq-client, bug in rabbitmq-client?
      }

  const rabbit = initRabbitMQ(connectionConfig);
  const gameEventsPublisher = createPublisher(rabbit, 'gameEvents', gameRoutingKeys, 'direct');

  fastify.decorate('rabbitMQ', rabbit);
  fastify.decorate('gameEventsPublisher', gameEventsPublisher);
}

export default fp(rabbitmqPlugin, {
  name: 'rabbitMQGlobalPlugin',
  fastify: '5.x'
})