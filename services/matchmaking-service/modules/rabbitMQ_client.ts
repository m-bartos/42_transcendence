import amqp, {Channel, ChannelModel, ConsumeMessage} from 'amqplib';

// Explicitly type these as possibly null
let connection: ChannelModel | null = null;
let channel: Channel | null = null;
export const defaultQueue = 'matchmakingQueue';

// Utility function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize RabbitMQ with retries
async function initialize(
  url: string = 'amqp://rabbitmq:5672',
  maxRetries: number = 5,
  retryDelayMs: number = 2000
): Promise<void> {
  if (connection !== null) return;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Ensure connection is typed as Connection
      connection = await amqp.connect(url);
      channel = await connection.createChannel();
      
      await channel.assertExchange('gameEvents', 'fanout', { durable: true });
      await channel.assertQueue(defaultQueue, { durable: true, autoDelete: false });
      await channel.bindQueue(defaultQueue, 'gameEvents', '');

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

      console.log('RabbitMQ connected successfully');
      return;
    } catch (error) {
      console.error(`Attempt ${attempt}/${maxRetries} failed to connect to RabbitMQ:`, error);
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to RabbitMQ after ${maxRetries} attempts`);
      }
      await delay(retryDelayMs);
    }
  }
}

// Type guard for channel
function assertChannel(): asserts channel is Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call initialize() first.');
  }
}

async function sendMessage(message: string, queue: string = defaultQueue): Promise<void> {
  assertChannel();
  
  try {
    const success = channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    if (!success) {
      throw new Error('Failed to send message - channel buffer full');
    }
    console.log(`Message sent to ${queue}: ${message}`);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

async function consume(queue: string, onMessage: (content: string) => void): Promise<void> {
  assertChannel();
  
  try {
    // @ts-ignore
    if (channel === null) {return;}
    await channel.assertQueue(queue, { durable: true });
    await channel.consume(
      queue,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          try {
            onMessage(msg.content.toString());
            channel.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            channel.nack(msg);
          }
        }
      },
      { noAck: false }
    );
    console.log(`Consuming messages from ${queue}`);
  } catch (error) {
    console.error('Error setting up consumer:', error);
    throw error;
  }
}

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
  consume,
  close,
};