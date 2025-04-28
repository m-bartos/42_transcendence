import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import AutoLoad from '@fastify/autoload';
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import wsRoutes from './routes/ws-routes.js'
import wsMatchRoutes from './routes/ws-match-routes.js'

const options = {};
export default async function app (fastify: FastifyInstance, opts: FastifyPluginOptions){

    const __dirname:string = dirname(fileURLToPath(import.meta.url));

    await fastify.register(AutoLoad, {
        dir: join(__dirname, 'plugins'),
        options: Object.assign({}, opts)
    });

    // TODO: WHY THE AUTOLOAD IS NOT LOADING ws-routes??
    await fastify.register(AutoLoad, {
        dir: join(__dirname, 'routes'),
        indexPattern: /.*-routes(\.js)$/i,
        ignorePattern: /.*\.js/,
        options: Object.assign({}, opts)
    });

    // loading wsRoutes manually
    await fastify.register(wsRoutes);
    await fastify.register(wsMatchRoutes);

}

export {options};


// import gamePlugin from './plugins/game-plugin.js'
// import rabbitmqPlugin from './plugins/rabbitMQ-plugin.js'
//
// import authPlugin from './plugins/auth-plugin.js'
// import corsPlugin from "./plugins/cors-plugin.js";

// import gameRoutes from './routes/http-routes.js'

// const serverOptions = {
//     logger: {
//       level: 'debug',
//       transport: {
//         target: 'pino-pretty'
//       }  }
//    }
//
// const fastify: FastifyInstance = Fastify(serverOptions)
//
// fastify.register(corsPlugin)
// fastify.register(rabbitmqPlugin)
// fastify.register(gamePlugin)
// fastify.register(authPlugin)
//
// fastify.register(gameRoutes)
// fastify.register(wsRoutes)
//
// const start = async () => {
//     try {
//         await fastify.listen({ port: 3000, host: '0.0.0.0' })
//     } catch (err) {
//         fastify.log.error(err)
//         process.exit(1)
//     }
// }
//
// // this will print all the routes that are registered in the fastify object
// fastify.ready()
//     .then(() => {
//         console.log(fastify.printRoutes());
//      })
//
// start()
//
// // clean shut down of ctrl+C, if something hangs during the closing process, it will terminate the proces in 10 seconds
// process.once('SIGINT', async function closeApplication() {
//     const tenSeconds = 10_000
//     const timeout = setTimeout(function forceClose() {
//         fastify.log.error('force closing server')
//         process.exit(1)
//     }, tenSeconds)
//
//     timeout.unref()
//
//     try {
//         await fastify.close()
//         fastify.log.info('Game-service turned off')
//     }
//     catch (err) {
//         fastify.log.error(err, 'Game-service had trouble turning off')
//     }
// })
