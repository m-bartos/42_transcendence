import fastify from "fastify";
import authPlugin from "./plugins/authPlugin.js";
import type { FastifyInstance } from "fastify";
import routePlugin from "./plugins/routePlugin.js";
import webSocket from '@fastify/websocket';

const app: FastifyInstance = fastify({ logger: true});
app.register(webSocket, {
    options: {
        maxPayload: 1000,
        clientTracking: true,
    }
});
app.register(authPlugin);
app.register(routePlugin);

await app.listen({port: 3000, host: "0.0.0.0"});