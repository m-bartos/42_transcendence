import {Connection, PublisherProps} from 'rabbitmq-client'

export const createPublisher = <RoutingKeys extends string>(
    rabbit: Connection,
    exchangeName: string,
    routingKeys: readonly RoutingKeys[],
    exchangeType: 'direct' | 'fanout' = 'direct'
) => {
    const publisher = rabbit.createPublisher({
        confirm: true,
        maxAttempts: 50,
        exchanges: [{ exchange: exchangeName, type: exchangeType, durable: true }]
    });

    async function onShutdown() {
        await publisher.close();
    }

    process.on('SIGINT', onShutdown);
    process.on('SIGTERM', onShutdown);

    const sendEvent = (routingKey: RoutingKeys, message: string): void => {
        publisher.send({ exchange: exchangeName, routingKey }, message).catch((reason) => {
            console.info(`Sending message to ${exchangeName} failed. Message: ${message}, Reason: ${reason}`);
        });
    };

    return { sendEvent };
};