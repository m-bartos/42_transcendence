import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from "fastify";
import fastifyWebsocket from '@fastify/websocket'
import fp from 'fastify-plugin'

declare module 'fastify' {
	interface FastifyInstance {
		broadcastInterval: ReturnType<typeof setInterval>;
	}
}

// interface WsQueryParams {
//     game_id: string;
//     player_id: string;
// }

const ws_plugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    await fastify.register(fastifyWebsocket, {options: { maxPayload: 1024 }})

    // Start periodic message sender - is this as it should be in fastify??? or is it just typescript?
    fastify.decorate('broadcastInterval', setInterval(() => {
        fastify.gameManager.sendGamesUpdate();
    }, 1000)) // Send every 1000ms (1 second)

    // Clean up on plugin close
    fastify.addHook('onClose', (instance, done) => {
        clearInterval(fastify.broadcastInterval);
		fastify.gameManager.closeAllWebSockets();
        done()
    })

	fastify.route({
		method: 'GET',
		url: '/api/games/ws',
		handler: (req, reply) => {
			reply.code(404).send();
		},
		wsHandler: async function (socket: fastifyWebsocket.WebSocket, req: FastifyRequest) {
			fastify.log.debug('WebSocket connection established');
			socket.send('Hello Fastify WebSockets');
		}
	});
}

export default fp(ws_plugin, {
    name: 'ws_plugin',
    fastify: '5.x'
})