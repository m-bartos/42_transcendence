import amqp, { Channel, Connection } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;
const defaultQueue = 'default_queue';

// Utility function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize RabbitMQ with retries
async function initialize(
  url: string = 'amqp://rabbitmq:5672',
  maxRetries: number = 5,
  retryDelayMs: number = 2000
): Promise<void> {
  if (connection) return; // Skip if already connected

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();
      await channel.assertQueue(defaultQueue, { durable: true });
      console.log('RabbitMQ connected successfully');
      return; // Exit on success
    } catch (error) {
      console.error(`Attempt ${attempt}/${maxRetries} failed to connect to RabbitMQ:`, error);
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to RabbitMQ after ${maxRetries} attempts`);
      }
      await delay(retryDelayMs); // Wait before retrying
    }
  }
}

async function sendMessage(message: string, queue: string = defaultQueue): Promise<void> {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call initialize() first.');
  }
  channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
  console.log(`Message sent to ${queue}: ${message}`);
}

async function consume(queue: string, onMessage: (content: string) => void): Promise<void> {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call initialize() first.');
  }
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      onMessage(msg.content.toString());
      channel?.ack(msg);
    }
  });
  console.log(`Consuming messages from ${queue}`);
}

async function close(): Promise<void> {
  if (channel) await channel.close();
  if (connection) await connection.close();
  connection = null;
  channel = null;
  console.log('RabbitMQ connection closed');
}

export const sendRabbitMQMessage = sendMessage;

export const RabbitMQ = {
  initialize,
  consume,
  close,
};