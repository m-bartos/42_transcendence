// ESM
import Fastify, {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify'
import gameGlobalPlugin from './plugins/game-plugin.js'
import gameRoutes from './routes/game/game_routes.js'
import wsPlugin from './routes/game/websockets.js'

const serverOptions = {
    logger: {
      level: 'debug',
      transport: {
        target: 'pino-pretty'
      }  }
   }

const fastify: FastifyInstance = Fastify(serverOptions)

fastify.register(wsPlugin)
fastify.register(gameGlobalPlugin)
fastify.register(gameRoutes)

const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
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
