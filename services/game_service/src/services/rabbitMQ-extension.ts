import {Connection, Publisher} from 'rabbitmq-client'

// Initialize:
export let rabbit: Connection;

export let GameEventsPublisher: Publisher;
const pendingGameEvents: string[] = [];

export const initRabbitMQ = ():void => {
    rabbit = new Connection({
        // have not tested the env! Could be also done as input parameters from fastify
        username: process.env.rabbitmq_username || 'admin',
        password: process.env.rabbitmq_password || 'admin123',
        hostname: process.env.rabbitmq_hostname || 'rabbitmq',
        port: process.env.rabbitmq_port || '5672',
        connectionName: process.env.rabbitmq_connection_name || 'game-service-connection',  // have not tested the env
        retryLow: 1000, // does not work, I still got default values of the rabbitmq-client, bug in rabbitmq-client?
        retryHigh: 5000, // does not work, I still got default values of the rabbitmq-client, bug in rabbitmq-client?
    });

    rabbit.on('error', (err) => {
        console.log('RabbitMQ connection error', err)
    })
    rabbit.on('connection', async () => {
        console.log('Connection successfully (re)established')
        await sendPendingGameEvents();
    })

    // Clean up when you receive a shutdown signal
    async function onShutdown() {
        await GameEventsPublisher.close()
        await rabbit.close()
    }
    process.on('SIGINT', onShutdown)
    process.on('SIGTERM', onShutdown)
}

// Declare a publisher
export const setupGameEventsPublisher = (): void => {
    GameEventsPublisher = rabbit.createPublisher({
        confirm: true,
        maxAttempts: 3,
        exchanges: [{exchange: 'gameEvents', type: 'fanout', durable: true}]})
}

export const sendGameEvent = async (message: string): Promise<void> =>
{
    try
    {
        await GameEventsPublisher.send({exchange: 'gameEvents'}, message);
    }
    catch
    {
        pendingGameEvents.push(message);
        console.info('Sending message to game event failed, message added to pendingGameEvents. Message: ', message);
    }
}

export const sendPendingGameEvents = async (): Promise<void> => {
    while (pendingGameEvents.length > 0) {
        const message = pendingGameEvents[0]; // Take first message
        try {
            await GameEventsPublisher.send({exchange: 'gameEvents'}, message);
            pendingGameEvents.shift(); // Remove if successful
        } catch (error) {
            console.error(`Retry failed for message ${message}: ${error}`);
            break; // Stop retrying if one fails
        }
    }
};