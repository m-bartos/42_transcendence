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

interface WsParams {
	gameId: string;
}

interface WsQuery {
    playerJWT: string;
}

interface UserInfoResponse {
	status: string;
	message: string;
	data: any;
}

interface WebSocketRequest extends FastifyRequest {
	QueryString: WsQuery
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
		url: '/play/:gameId',
		schema: {
			querystring: fastify.getSchema("schema:game:ws:query")
		},
		handler: (req, reply) => {
			reply.code(404).send();
		},
		wsHandler: async function (origSocket, req) {
			// on connection
			const socket = origSocket as GameWebSocket;
			try
			{
				const { gameId } = req.params as WsParams;
				const { playerJWT } = req.query as WsQuery;
				socket.gameId = gameId;
				socket.playerSessionId = await fastify.authenticateWS(fastify, playerJWT);
				const response = await fetch('http://auth_service:3000/user/info', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${playerJWT}`
					}
				});

				if (!response.ok) {
					throw new Error(`Error: ${response.status} ${response.statusText}`);
				}

				const resJSON = await response.json() as UserInfoResponse;
				socket.username = resJSON.data.username;
				this.gameManager.assignPlayerToGame(socket);
			}
			catch (e)
			{
				fastify.log.error(e);
				socket.close();
			}

			socket.on('message', (rawData) => {
                try
                {
                    const message = JSON.parse(rawData.toString());
					
					if (message.type === 'movePaddle') {
						this.gameManager.movePaddleInGame(socket.gameId, socket.playerSessionId, message.direction)
					}
				}
				catch
				{
					// IGNORE INVALID MESSAGES
				}
			});

			socket.on('close', () => {
				// TODO: throwing errors when I close the socket from somewhere and the delete the game_id
				removePlayerFromGame(socket.gameId, socket.playerSessionId);
				// TODO: delete where nobody is connected for some time...
			})

		}
	});
}

export default fp(ws_plugin, {
    name: 'ws_plugin',
    fastify: '5.x'
})