import Fastify from 'fastify'
import fp from 'fastify-plugin'
import type {FastifyInstance} from 'fastify'
import knexPlugin from "./plugins/knexPlugin.js";
import routesPlugin from "./plugins/routesPlugin.js"
import schemas from "./schemas.js";
import authPlugin from "./plugins/authPlugin.js";

const fastify: FastifyInstance = Fastify();


fastify.register(import('@fastify/cors'), {
    origin: true, // or specify your frontend origin like 'http://localhost:8080'
    methods: ['GET', 'POST', 'PUT', 'DELETE']
})

await fastify.register(authPlugin);

// Register JWT plugin with configuration
await fastify.register(import('@fastify/jwt'), {
    secret: 'my-super-secret-key', // Hardcoded for testing
    sign: {
        expiresIn: '1h' // Initial expiration: 1 hour
    }
});

await fastify.register(knexPlugin);

fastify.register(fp(routesPlugin));

Object.values(schemas).forEach((schema) => {
    fastify.addSchema(schema);
})


fastify.ready()
.then(():void => {
    console.log(`Server has loaded all plugins and routes!`);
})

fastify.listen({port: 3000, host: '0.0.0.0'}).then((address: string): void => {
    console.log(`Server is running with : ${address}`);
})