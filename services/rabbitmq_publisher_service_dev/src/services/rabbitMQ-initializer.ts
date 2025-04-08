import {Connection, ConnectionOptions} from 'rabbitmq-client'

export const initRabbitMQ = (options: ConnectionOptions):Connection => {

    const rabbit = new Connection(options);

    rabbit.on('error', (err) => {
        console.log('RabbitMQ connection error', err)
    });
    rabbit.on('connection', async () => {
        console.log('Connection successfully (re)established')
    });

    // Clean up when you receive a shutdown signal
    async function onShutdown() {
        await rabbit.close()
    }

    process.on('SIGINT', onShutdown);
    process.on('SIGTERM', onShutdown);

    return rabbit;
}