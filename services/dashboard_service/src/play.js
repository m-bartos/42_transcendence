import {Connection} from 'rabbitmq-client'
import parseGameEndedEventMessage from '../dist/parseGameEndedMessage.js'

console.log("Running play.js from node!")

const AmqpConnectionConfig =
    {
        // have not tested the env! Could be also done as input parameters from fastify
        username: process.env.rabbitmq_username || 'admin',
        password: process.env.rabbitmq_password || 'admin123',
        hostname: process.env.rabbitmq_hostname || 'rabbitmq',
        port: process.env.rabbitmq_port || '5672',
        connectionName: process.env.rabbitmq_connection_name || 'dashboard-service-connection',  // have not tested the env
        retryLow: 1000, // does not work, I still got default values of the rabbitmq-client, bug in rabbitmq-client?
        retryHigh: 5000, // does not work, I still got default values of the rabbitmq-client, bug in rabbitmq-client?
    }


const rabbitMq = new Connection(AmqpConnectionConfig);

rabbitMq.on('connection', () => {
    console.log('Connected to RabbitMQ service');
})

rabbitMq.on('error', (err) => {
    console.error("Error",err);
})
// subscriber/consumer
const sub = rabbitMq.createConsumer({
    queue: "match-service-queue",
    exchange: "gameEvents",
    queueBindings: [
        { exchange: 'gameEvents', queue: 'match-service-queue', routingKey: 'game.start' },
        { exchange: 'gameEvents', queue: 'match-service-queue', routingKey: 'game.end' }
    ],
    exchanges: [{ exchange: 'gameEvents', type: 'direct', durable: true }]
}, async (msg) => {
    try {
        const payload = JSON.parse(msg.body);
        console.log('📩 Received game event:', payload);

        if (msg.routingKey === 'game.start') {
            console.log('⚽ Game started:', payload.gameId);
        } else if (msg.routingKey === 'game.end') {
            console.log('🏁 Game ended:', payload.gameId);
            try {
                console.log(`Message parser:`, parseGameEndedEventMessage(msg.body));
            }
            catch (error) {
                console.error(error);
            }
        }
    } catch (err) {
        console.error('❌ Error processing message:', err);
        //reply(new Error('Failed to process')); // ✅ NACK
    }
});

sub.on('error', (err) => {
    console.error("Error", err);
})