import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { defaultQueue, RabbitMQ, sendRabbitMQMessage } from '../services/rabbitMQ-client.js'

declare module 'fastify' {
  interface FastifyInstance {
	sendRabbitMQMessage: (message: string, queue?: string) => Promise<void>;
    RabbitMQconsumer: (message: string, queue?: string) => Promise<void>;
  }
}

const rabbitMQPlugin: FastifyPluginAsync = async (fastify, opts) => {
  try {
    await RabbitMQ.initialize('amqp://admin:admin123@rabbitmq:5672', 50, 2000); // 50 retries, 2s delay
    fastify.log.info('RabbitMQ initialized with retry logic via plugin');

    fastify.decorate('sendRabbitMQMessage', sendRabbitMQMessage);

    fastify.addHook('onClose', async () => {
      await RabbitMQ.close();
      fastify.log.info('RabbitMQ connection closed');
    });

    fastify.addHook('onReady', async () => {
      await RabbitMQ.consume(defaultQueue, (message) => {
        try
        {
          const parsedMessage = JSON.parse(message);
          fastify.log.info(`Received message: ${JSON.stringify(parsedMessage)}`);

          if (parsedMessage.event === 'gameStarted')
          {
            const { gameId} = parsedMessage;

            if (!gameId) {
              fastify.log.error('No gameId found in gameStarted event');
              return
            }

            fastify.matchManager.removeMatch(gameId);
            fastify.log.info(`Deleted match with gameId: ${gameId}`);
          }

        } catch (error: unknown) {
          if (error instanceof Error)
          {
            fastify.log.error(`Error processing message: ${error.message}`);
          }
        }
      });
    });

  } catch (error) {
    fastify.log.error('Failed to initialize RabbitMQ after retries:', error);
    throw error;
  }
};


export default fp(rabbitMQPlugin, {
    name: 'rabbitMQGlobalPlugin',
    fastify: '5.x'
})