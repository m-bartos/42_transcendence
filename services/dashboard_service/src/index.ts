import fastify from 'fastify';
import authPlugin from "./plugins/authPlugin.js";
import routePlugin from "./plugins/routePlugin.js";
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const app = fastify({logger: true});

app.register(authPlugin);
app.register(routePlugin);

await app.listen({port: 5005, host: "0.0.0.0"})

