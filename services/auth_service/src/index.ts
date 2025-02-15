import Fastify from 'fastify'
import type {FastifyInstance} from 'fastify'

import routesPlugin from "./routesPlugin.js"
import schemas from "./schemas.js";

const app: FastifyInstance = Fastify();

app.register(routesPlugin);

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
export {app};