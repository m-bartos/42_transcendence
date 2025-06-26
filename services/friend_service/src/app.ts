import fastify, {FastifyInstance} from 'fastify';
import routePlugin from './plugins/routesPlugin.js';
import knexPlugin from './plugins/knexPlugin.js';
import authPlugin from "./plugins/authPlugin.js";
import schemaPlugin from "./plugins/schemaPlugin.js";
import customErrorHandler from './plugins/errorHandlerPlugin.js'
const app: FastifyInstance = fastify({logger: true});

app.register(schemaPlugin);
app.register(customErrorHandler);
app.register(routePlugin);
app.register(knexPlugin);
app.register(authPlugin);

await app.listen({port: 3000, host: "0.0.0.0"});


try
{
    await app.ready()
    console.log("Fastify is ready.");
}
catch(err) {
    console.log("Fastify encountered an error: ",err);
}

