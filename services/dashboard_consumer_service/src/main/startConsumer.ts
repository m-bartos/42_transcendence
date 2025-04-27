import rabbit, {Consumer, Connection} from 'rabbitmq-client'
import {amqpConnectionConfig, amqpConsumerConfig} from "../config/configRabbitMqAndConsumer.js";
import {handleGameEndEvents} from "../handler/handleGameEndEvents.js";
import type { AsyncMessage } from "rabbitmq-client";
export async function startConsumer(): Promise<{connection: Connection; consumer: Consumer}> {
    const connection = new rabbit.Connection(amqpConnectionConfig);
    const consumer: Consumer = connection.createConsumer(amqpConsumerConfig, handleGameEndEvents);

    // here one should catch specific errors and act on them as per lib. documentation
    // some errors the lib can handle automatically and some don't.
    // since I am using this in index.ts I should throw the unrecoverable errors to reject the promise

    connection.on("connection", () => {
        console.log("Connected to rabbitMq");
    })

    connection.on("error", (error) => {
        console.error("RabbitMq failed after many attempts to re-connect and crashed:", error);
    })

    consumer.on('error', (err) => {
        console.log('Consumer failed with error', err);
    })

    return {connection, consumer};

}
