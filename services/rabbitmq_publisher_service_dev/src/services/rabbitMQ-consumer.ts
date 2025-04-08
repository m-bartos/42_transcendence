// src/services/rabbitMQ-consumer.ts

import { Connection } from 'rabbitmq-client';

type RabbitMQMessage = {
    body: string;
    routingKey: string;
    contentType?: string;
    [key: string]: any;
};

type RabbitMQReply = (response: any) => void;


// export const setupGameEventsConsumer = (rabbit: Connection): void => {
//     const consumer = rabbit.createConsumer(
//         {
//             queue: 'match-service-queue',
//             queueBindings: [
//                 { exchange: 'gameEvents', queue: 'match-service-queue', routingKey: 'game.start' },
//                 { exchange: 'gameEvents', queue: 'match-service-queue', routingKey: 'game.end' }
//             ],
//             exchanges: [
//                 { exchange: 'gameEvents', type: 'direct', durable: true }
//             ]
//         },
//         async (msg: RabbitMQMessage, reply: RabbitMQReply) => {
//             try {
//                 const payload = JSON.parse(msg.body);
//                 console.log('📩 Received game event:', payload);
//
//                 if (msg.routingKey === 'game.start') {
//                     console.log('⚽ Game started:', payload.gameId);
//                 } else if (msg.routingKey === 'game.end') {
//                     console.log('🏁 Game ended:', payload.gameId);
//                 }
//
//                // reply(null); // ✅ ACK
//             } catch (err) {
//                 console.error('❌ Error processing message:', err);
//                 //reply(new Error('Failed to process')); // ✅ NACK
//             }
//         }
//     );
//
//     process.on('SIGINT', () => consumer.close());
//     process.on('SIGTERM', () => consumer.close());
// };
