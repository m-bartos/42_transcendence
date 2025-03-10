import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { RabbitMQ, sendRabbitMQMessage } from '../services/rabbitMQ-client.js'

declare module 'fastify' {
  interface FastifyInstance {
	sendRabbitMQMessage: (message: string, queue?: string) => Promise<void>;
  }
}

const rabbitmqPlugin: FastifyPluginAsync = async (fastify, opts) => {
  try {
    await RabbitMQ.initialize('amqp://admin:admin123@rabbitmq:5672', 50, 2000); // 50 retries, 2s delay
    fastify.log.info('RabbitMQ initialized with retry logic via plugin');

    fastify.decorate('sendRabbitMQMessage', sendRabbitMQMessage);

    fastify.addHook('onClose', async () => {
      await RabbitMQ.close();
      fastify.log.info('RabbitMQ connection closed');
    });
  } catch (error) {
    fastify.log.error('Failed to initialize RabbitMQ after retries:', error);
    throw error;
  }
};


export default fp(rabbitmqPlugin, {
    name: 'rabbitMQGlobalPlugin',
    fastify: '5.x'
})