import Fastify, {FastifyInstance} from 'fastify'
import matchPlugin from './plugins/match-plugin.js'
import wsPlugin from './routes/ws-routes.js'
import rabbitMQPlugin from './plugins/rabbitMQ-plugin.js'
import matchmakingRoutes from "./routes/http-routes.js";
import authPlugin from "./plugins/auth-plugin.js";
import corsPlugin from "./plugins/cors-plugin.js";


const serverOptions = {
    logger: {
      level: 'debug',
      transport: {
        target: 'pino-pretty'
      }  }
   }

const fastify: FastifyInstance = Fastify(serverOptions)

fastify.register(corsPlugin)
fastify.register(authPlugin)
fastify.register(matchPlugin)
fastify.register(rabbitMQPlugin)

fastify.register(wsPlugin)
fastify.register(matchmakingRoutes)

const start = async () => {
    try {
        await fastify.listen({ port: 3002, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

// this will print all the routes that are registered in the fastify object
fastify.ready()
    .then(() => {
        console.log(fastify.printRoutes());
     })

start()

// clean shut down of ctrl+C, if something hangs during the closing process, it will terminate the proces in 10 seconds
process.once('SIGINT', async function closeApplication() {
    const tenSeconds = 10_000
    const timeout = setTimeout(function forceClose() {
        fastify.log.error('force closing server')
        process.exit(1)
    }, tenSeconds)

    timeout.unref()

    try {
        await fastify.close()
        fastify.log.info('Matchmaking-service turned off')
    } 
    catch (err) {
        fastify.log.error(err, 'Matchmaking-service had trouble turning off')
    }
})
