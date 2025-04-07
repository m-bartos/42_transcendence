export const amqpConnectionConfig =
    {
        username: process.env.rabbitmq_username || 'admin',
        password: process.env.rabbitmq_password || 'admin123',
        hostname: process.env.rabbitmq_hostname || 'rabbitmq',
        port: process.env.rabbitmq_port || '5672',
        connectionName: 'dashboard-consumer-service-connection',
        retryLow: 1000,
        retryHigh: 5000
    };

export const amqpConsumerConfig = {
        queue: 'match-service-queue',
        exchange: 'gameEvents',
        queueBindings: [{ exchange: 'gameEvents', queue: 'match-service-queue', routingKey: 'game.end' }],
        exchanges: [{exchange: 'gameEvents', type: 'direct', durable: true }]
}
