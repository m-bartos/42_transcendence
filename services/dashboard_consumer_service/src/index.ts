import {startConsumer} from './main/startConsumer.js';

startConsumer().then(
    ({connection, consumer}) => {
        consumer.on('ready', () => {
            console.log("Dashboard consumer process started...");
        })

        process.on("SIGINT", async () => {
            console.log("Shutting down dashboard consumer.");
            await consumer.close();
            await connection.close()
            process.exit(0);
        })
    }
)
.catch((error) => {
    console.log("Dashboard consumer error:", error);
});
