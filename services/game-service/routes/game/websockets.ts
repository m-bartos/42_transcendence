import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from "fastify";
import fp from 'fastify-plugin'
import fastifyWebsocket from '@fastify/websocket'

import { GameWebSocket } from "../../types/game.js";
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
        fastify.gameManager.sendGamesUpdate(fastify);
    }, 1000/60));

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
		wsHandler: async function (origSocket, req) {
			// on connection
			const { game_id, player_id} = req.query as WsQueryParams;
			const socket = origSocket as GameWebSocket;

			socket.gameId = game_id;
			socket.playerId = player_id;

			try
			{
				this.gameManager.assignPlayerToGame(socket);
				socket.send('You have succesfully joined the game.');
			}
			catch (e)
			{
				fastify.log.error(e);
				socket.send(JSON.stringify(e));
				socket.close();
			}

			// handle paddle move
			socket.on('message', (rawData) => {
				try {
					const message = JSON.parse(rawData.toString());
					
					if (message.type === 'MOVE_PADDLE') {
						const game = this.gameManager.getGame(socket.gameId);
						game.movePaddle(socket.playerId, message.direction);
					}
				} catch (error) {
					console.error('Error handling message:', error);
					socket.send(JSON.stringify({ error: 'Invalid message format' }));
				}
			});

			// on close - just disconnecting, not deleting the game
			socket.on('close', () => {
				try {
					const game = this.gameManager.getGame(socket.gameId);
					game.disconnectPlayer(socket.playerId);
				} catch (error) {
					console.error(`Error disconnecting player ${socket.playerId} from game ${socket.gameId}:`, error);
				}
			})

		}
	});
}

export default fp(ws_plugin, {
    name: 'ws_plugin',
    fastify: '5.x'
})