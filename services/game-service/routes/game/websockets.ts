import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from "fastify";
import fastifyWebsocket from '@fastify/websocket'
import fp from 'fastify-plugin'

import { wsQuerySchema } from './schemas/ws-querystring.js';

declare module 'fastify' {
	interface FastifyInstance {
		broadcastInterval: ReturnType<typeof setInterval>;
	}
}

interface WsQueryParams {
    game_id: string;
    player_id: string;
}

interface WebSocketRequest extends FastifyRequest {
	QueryString: WsQueryParams
}

const ws_plugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    await fastify.register(fastifyWebsocket, {options: { maxPayload: 1024 }});

    // Start periodic message sender - is this as it should be in fastify??? or is it just typescript?
    fastify.decorate('broadcastInterval', setInterval(() => {
        fastify.gameManager.sendGamesUpdate();
    }, 1000)); // Send every 1000ms (1 second)

    // Clean up on plugin close
    fastify.addHook('onClose', (instance, done) => {
        clearInterval(fastify.broadcastInterval);
		fastify.gameManager.closeAllWebSockets();
        done()
    });

	fastify.addSchema(wsQuerySchema);

	fastify.route({
		method: 'GET',
		url: '/api/games/ws',
		schema: {
			querystring: fastify.getSchema("schema:game:ws:query")
		},
		handler: (req, reply) => {
			reply.code(404).send();
		},
		wsHandler: async function (socket: fastifyWebsocket.WebSocket, req) {
			const { game_id, player_id} = req.query as WsQueryParams;
			fastify.log.debug('Game_id: ' + game_id);
			fastify.log.debug('Player_id: ' + player_id);

			try
			{
				this.gameManager.assignPlayerToGame(game_id, player_id, socket);
				socket.send('You have succesfully joined the game.');
			}
			catch (e)
			{
				fastify.log.error(e);
				socket.send(JSON.stringify(e));
				socket.close();
			}

		}
	});
}

export default fp(ws_plugin, {
    name: 'ws_plugin',
    fastify: '5.x'
})