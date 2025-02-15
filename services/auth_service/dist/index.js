import Fastify from 'fastify';
import routesPlugin from "./routesPlugin.js";
import schemas from "./schemas.js";
const app = Fastify();
app.register(routesPlugin);
Object.values(schemas).forEach((schema) => {
    app.addSchema(schema);
});
app.ready()
    .then(() => {
    console.log(`Server has loaded all plugins and routes!`);
});
app.listen({ port: 3000, host: '0.0.0.0' }).then((address) => {
    console.log(`Server is running with : ${address}`);
});
export { app };
