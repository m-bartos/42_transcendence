import fastify from 'fastify';
import authPlugin from "./plugins/authPlugin.js";
import routePlugin from "./plugins/routePlugin.js";
import knexPlugin from "./plugins/knexPlugin.js";

const app = fastify({logger: true});

app.register(authPlugin);
app.register(routePlugin);
app.register(knexPlugin);

await app.listen({port: 5005, host: "0.0.0.0"})
