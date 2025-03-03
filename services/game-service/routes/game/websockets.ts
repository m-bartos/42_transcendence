import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from "fastify";
import fp from 'fastify-plugin'
import fastifyWebsocket from '@fastify/websocket'

import { GameWebSocket } from "../../types/game.js";
import { wsQuerySchema } from './schemas/ws-querystring.js';
import { removePlayerFromGame } from "../../modules/gameManager.js";

declare module 'fastify' {
	interface FastifyInstance {
		broadcastLiveGames: ReturnType<typeof setInterval>;
		broadcastPendingAndFinishedGames: ReturnType<typeof setInterval>;
		checkPendingGames: ReturnType<typeof setInterval>;
	}
}

interface WsQueryParams {
    gameId: string;
    playerId: string;
}

interface WebSocketRequest extends FastifyRequest {
	QueryString: WsQueryParams
}

const ws_plugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    await fastify.register(fastifyWebsocket, {options: { maxPayload: 1024 }});

    // Start periodic message sender - is this as it should be in fastify??? or is it just typescript?
    fastify.decorate('broadcastLiveGames', setInterval(() => {
        fastify.gameManager.broadcastLiveGames(fastify);
    }, 1000/60));

    fastify.decorate('broadcastPendingAndFinishedGames', setInterval(() => {
        fastify.gameManager.broadcastPendingAndFinishedGames(fastify);
    }, 500));

	fastify.decorate('checkPendingGames', setInterval(() => {
        fastify.gameManager.checkPendingGames(fastify);
    }, 1000));

    // Clean up on plugin close
    fastify.addHook('onClose', (instance, done) => {
        clearInterval(fastify.broadcastLiveGames);
        clearInterval(fastify.broadcastPendingAndFinishedGames);
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
			const { gameId, playerId} = req.query as WsQueryParams;
			const socket = origSocket as GameWebSocket;

			socket.gameId = gameId;
			socket.playerId = playerId;

			try
			{
				this.gameManager.assignPlayerToGame(socket);
			}
			catch (e)
			{
				fastify.log.error(e);
				socket.close();
			}

			socket.on('message', (rawData) => {
				// const message = JSON.parse(rawData.toString());
                try
                {
                    const message = JSON.parse(rawData.toString());
					
					if (message.type === 'movePaddle') {
						this.gameManager.movePaddleInGame(socket.gameId, socket.playerId, message.direction)
					}
				}
				catch
				{
					// IGNORE INVALID MESSAGES
				}
			});

			socket.on('close', () => {
				// TODO: throwing errors when I close the socket from somewhere and the delete the game_id
				removePlayerFromGame(socket.gameId, socket.playerId);
				// TODO: delete where nobody is connected for some time...
			})

		}
	});
}

export default fp(ws_plugin, {
    name: 'ws_plugin',
    fastify: '5.x'
})