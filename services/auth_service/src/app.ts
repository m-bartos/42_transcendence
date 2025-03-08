import Fastify from 'fastify'

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import AutoLoad from '@fastify/autoload';

const __dirname = dirname(fileURLToPath(import.meta.url));

import type {FastifyInstance} from 'fastify'
import schemas from "./schemas.js";


const fastify: FastifyInstance = Fastify();


fastify.register(import('@fastify/cors'), {
    origin: true, // or specify your frontend origin like 'http://localhost:8080'
    methods: ['GET', 'POST', 'PUT', 'DELETE']
})


// Register JWT plugin with configuration
await fastify.register(import('@fastify/jwt'), {
    secret: 'my-super-secret-key', // Hardcoded for testing
    sign: {
        expiresIn: '1h' // Initial expiration: 1 hour
    }
});


const opts = {};
await fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
});

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