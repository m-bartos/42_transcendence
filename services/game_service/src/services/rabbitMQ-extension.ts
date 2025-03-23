import {Connection, Publisher} from 'rabbitmq-client'

// Initialize:
export let rabbit: Connection;

export let gameEventsPublisher: Publisher;

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
    })

    // Clean up when you receive a shutdown signal
    async function onShutdown() {
        await gameEventsPublisher.close()
        await rabbit.close()
    }
    process.on('SIGINT', onShutdown)
    process.on('SIGTERM', onShutdown)
}

// Declare a publisher
export const setupGameEventsPublisher = (): void => {
    gameEventsPublisher = rabbit.createPublisher({
        confirm: true,
        maxAttempts: 50,
        exchanges: [{exchange: 'gameEvents', type: 'direct', durable: true}]});
}

export const sendGameEvent = async (key: string, message: string): Promise<void> =>
{
    try
    {
        await gameEventsPublisher.send({exchange: 'gameEvents', routingKey: key}, message);
    }
    catch
    {
        // add GRAVEYARDS of events when sending fails
        console.info('Sending message to game event failed, message added to pendingGameEvents. Message: ', message);
    }
}