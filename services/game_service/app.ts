import Fastify, {FastifyInstance} from 'fastify'
import gameGlobalPlugin from './plugins/game-plugin.js'
import gameRoutes from './routes/game/game_routes.js'
import wsPlugin from './routes/game/websockets.js'
import rabbitMQPlugin from './plugins/rabbitMQ-plugin.js'
import cors from '@fastify/cors'
import authPlugin from './plugins/auth-plugin.js'

const serverOptions = {
    logger: {
      level: 'debug',
      transport: {
        target: 'pino-pretty'
      }  }
   }

const fastify: FastifyInstance = Fastify(serverOptions)

fastify.register(cors, {
    origin: true, // or specify your frontend origin like 'http://localhost:8080'
    methods: ['GET', 'POST', 'PUT', 'DELETE']
})

await fastify.register(import('@fastify/jwt'), {
    secret: 'my-super-secret-key', // Hardcoded for testing
    sign: {
        expiresIn: '1h' // Initial expiration: 1 hour
    }
});

fastify.register(rabbitMQPlugin)
fastify.register(gameGlobalPlugin)
fastify.register(authPlugin)

fastify.register(wsPlugin)
fastify.register(gameRoutes)

const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' })
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
        fastify.log.info('Game-service turned off')
    } 
    catch (err) {
        fastify.log.error(err, 'Game-service had trouble turning off')
    }
})
