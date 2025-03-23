import {Connection, Consumer} from 'rabbitmq-client'
import {getMatches, removeMatch} from "./match-manager.js";

// Initialize:
export let rabbit: Connection;

export let gameEventsConsumer: Consumer ;

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
        await gameEventsConsumer.close()
        await rabbit.close()
    }
    process.on('SIGINT', onShutdown)
    process.on('SIGTERM', onShutdown)
}

// Declare a publisher
export const setupGameEventsConsumer = (): void => {
    gameEventsConsumer = rabbit.createConsumer({
        queue: 'match-service-queue',
        queueBindings: [{
            exchange: 'gameEvents',
            queue: 'match-service-queue',
            routingKey: 'game-started'
        }],
        exchanges: [{exchange: 'gameEvents', type: 'direct', durable: true}]},
        async (msg, reply) =>{
            const gameStartedEvent = JSON.parse(msg.body);
            console.log("Got message: ", gameStartedEvent);
            if (msg)
            {
                removeMatch(gameStartedEvent.gameId);
            }
    });
}
