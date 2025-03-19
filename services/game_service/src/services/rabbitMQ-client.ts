import amqp, { Channel, ChannelModel } from 'amqplib';

// Explicitly type these as possibly null
let connection: ChannelModel | null = null;
let channel: Channel | null = null;
const exchangeName = 'gameEvents';

// Utility function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize RabbitMQ with retries
async function initialize(
  url: string = 'amqp://rabbitmq:5672',
  maxRetries: number = 500,
  retryDelayMs: number = 2000
): Promise<void> {
  if (connection !== null) return;

  for (let attempt: number = 1; attempt <= maxRetries; attempt++) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();

      // Assert the exchange only (no queue needed for publishing)
      await channel.assertExchange(exchangeName, 'fanout', { durable: true });

      // Add error handlers
      connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        connection = null;
        channel = null;
      });

      connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        connection = null;
        channel = null;
      });

      console.log('RabbitMQ connected successfully for publishing');
      return;
    } catch (error) {
      //console.error(`Attempt ${attempt}/${maxRetries} failed to connect to RabbitMQ:`, error);
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to RabbitMQ after ${maxRetries} attempts`);
      }
      await delay(retryDelayMs);
    }
  }
}

// Publish message to the gameEvents exchange
async function sendMessage(message: string): Promise<void> {

  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized. Call initialize() first.');
    }
    const success = channel.publish(
      exchangeName,
      '', // Routing key is empty for fanout exchange
      Buffer.from(message),
      { persistent: true }
    );
    if (!success) {
      throw new Error('Failed to publish message - channel buffer full');
    }
    console.log(`Message published to ${exchangeName}: ${message}`);
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
}

// Close the connection
async function close(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  } finally {
    connection = null;
    channel = null;
    console.log('RabbitMQ connection closed');
  }
}

export const sendRabbitMQMessage = sendMessage;

export const RabbitMQ = {
  initialize,
  close,
};