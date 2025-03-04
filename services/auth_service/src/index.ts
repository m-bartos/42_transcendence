import Fastify from 'fastify'
import fp from 'fastify-plugin'
import type {FastifyInstance} from 'fastify'
import knexPlugin from "./plugins/knexPlugin.js";
import routesPlugin from "./plugins/routesPlugin.js"
import schemas from "./schemas.js";
import authPlugin from "./plugins/authPlugin.js";

const app: FastifyInstance = Fastify();

await app.register(authPlugin);

// Register JWT plugin with configuration
await app.register(import('@fastify/jwt'), {
    secret: 'my-super-secret-key', // Hardcoded for testing
    sign: {
        expiresIn: '1h' // Initial expiration: 1 hour
    }
});

await app.register(knexPlugin);

app.register(fp(routesPlugin));

Object.values(schemas).forEach((schema) => {
    app.addSchema(schema);
})


app.ready()
.then(():void => {
    console.log(`Server has loaded all plugins and routes!`);
})

app.listen({port: 3000, host: '0.0.0.0'}).then((address: string): void => {
    console.log(`Server is running with : ${address}`);
})