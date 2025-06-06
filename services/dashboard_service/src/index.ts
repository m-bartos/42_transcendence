import fastify from 'fastify';
import authPlugin from "./plugins/authPlugin.js";
import routePlugin from "./plugins/routePlugin.js";
import knexPlugin from "./plugins/knexPlugin.js";
import corsPlugin from "./plugins/corsPlugin.js";

const app = fastify({logger: true});

app.register(authPlugin);
app.register(routePlugin);
app.register(knexPlugin);
app.register(corsPlugin);

await app.listen({port: 3000, host: "0.0.0.0"})
