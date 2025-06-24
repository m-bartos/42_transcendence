import {applySecret} from "../utils/retrieveSecret.js";

const dashPass = applySecret("dashboardRabbitPassword");

export const amqpConnectionConfig =
    {
        username: process.env.rabbitmq_username || "dashboard_service",
        password: process.env.rabbitmq_password || dashPass,
        hostname: process.env.rabbitmq_hostname || 'rabbitmq_service',
        port: process.env.rabbitmq_port || '5672',
        connectionName: 'dashboard-consumer-service-connection',
        retryLow: 1000,
        retryHigh: 5000
    };

export const amqpConsumerConfig = {
        queue: 'game-service-queue',
        exchange: 'gameEvents',
        queueBindings: [
            { exchange: 'gameEvents', queue: 'game-service-queue', routingKey: 'game.end.multi' },
            { exchange: 'gameEvents', queue: 'game-service-queue', routingKey: 'game.end.split' },
            { exchange: 'gameEvents', queue: 'game-service-queue', routingKey: 'game.end.tournament' }
        ],
        exchanges: [{exchange: 'gameEvents', type: 'direct', durable: true }]
}
