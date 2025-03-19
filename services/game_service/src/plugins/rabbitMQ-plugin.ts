import { FastifyPluginAsync, FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import amqp, { Connection, Channel, ChannelModel } from 'amqplib';
import {sendRabbitMQMessage} from "../services/rabbitMQ-client.js";

declare module 'fastify' {
  interface FastifyInstance {
    rabbitMqConnection: Connection;
    // Why if game.ts imports and uses it directly?
    sendRabbitMQMessage: (message: string, queue?: string) => Promise<void>;
    isRabbitMqConnected(): boolean;
    isRabbitMqBlocked(): boolean;
  }
}

async function rabbitmqPlugin(fastify: FastifyInstance, opt: FastifyInstance): Promise<void> {
  let connection: Connection | null = null;
  let isRabbitMqConnected: boolean = false;
  let isRabbitMqBlocked: boolean = false;
  const url: string = 'amqp://admin:admin123@rabbitmq:5672';
  fastify.decorate('rabbitMQConnection', connection);
  fastify.decorate('isRabbitMqConnected', ():boolean => isRabbitMqConnected);
  fastify.decorate('isRabbitMqBlocked', ():boolean => isRabbitMqBlocked);

  // Setup events on connection object.
  function setupEventListeners(connection: Connection) {
    // Remove old events
    connection?.removeAllListeners('close');
    connection?.removeAllListeners('error');
    connection?.removeAllListeners('blocked');
    connection?.removeAllListeners('unblocked');
    // Register events on connection object
    connection?.on('close', async () => {
      fastify.log.error('RabbitMQ connection closed');
      isRabbitMqConnected = false;
      // @ts-ignore
      connection = null;
    });
    connection?.on('error', () => {
      fastify.log.error('RabbitMQ connection error:');
      isRabbitMqConnected = false;
      // @ts-ignore
      connection = null;
    })
    connection?.on('blocked', (reason: string) => {
      fastify.log.warn(`RabbitMq blocked: ${reason}`);
      isRabbitMqConnected = true;
      isRabbitMqBlocked = true;
    })
    connection?.on('unblocked', () => {
      fastify.log.warn('RabbitMQ unblocked');
      isRabbitMqConnected = true;
      isRabbitMqBlocked = false;
    })
  }


  // First try at the Fastify boot process = plugin registration
  try
  {
    // @ts-ignore
    connection = await amqp.connect(url);
    isRabbitMqConnected = true;
    // @ts-ignore
    setupEventListeners(connection);
  }
  catch (error)
  {
    fastify.log.error('Failed to initialize RabbitMQ on startup:', error);
  }

  // Run continuously in the background
  // Check this out. This is an async IIFE (Immediately Invoked Function Expression).
  (async function retryInBackground() {
    let retryDelay: number = 5000;
    const maxDelay: number = 30000;
    while(true)
    {
      await sleep(retryDelay);
      if (!isRabbitMqConnected)
      {
        fastify.log.warn(`Trying to connect to RabbitMQ`);
        try {
          // @ts-ignore
          connection = await amqp.connect(url);
          isRabbitMqConnected = true;
          retryDelay = 5000;
          // @ts-ignore
          setupEventListeners(connection);
          fastify.log.info('RabbitMQ connection established');
        }
        catch (err)
        {
          retryDelay = Math.min(retryDelay * 2, maxDelay);
          fastify.log.warn(`RabbitMq reconnection failed. Trying again in: ${retryDelay}`)
        }
      }
    }
  })();

}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default fp(rabbitmqPlugin, {
  name: 'rabbitMQGlobalPlugin',
  fastify: '5.x'
})