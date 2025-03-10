import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin'
import fastifyWebsocket from '@fastify/websocket'

import { wsQuerySchema } from './schemas/ws-querystring.js';
import { removePlayerFromGame } from "../services/game-manager.js";
import { WsQuery, WsParams, GameWebSocket } from "../types/websocket.js";

interface UserInfoResponse {
	status: string;
	message: string;
	data: any;
}

const wsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    await fastify.register(fastifyWebsocket, {options: { maxPayload: 1024 }}); // INFO: Fastify do not execute wsHandler when there is no await

	fastify.addSchema(wsQuerySchema);

	fastify.route({
		method: 'GET',
		url: '/play/:gameId',
		schema: {
			querystring: fastify.getSchema("schema:game:ws:query")
		},
		preHandler: fastify.authenticateWsPreHandler,
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
				if (req.session_id !== undefined)
				{
					socket.playerSessionId = req.session_id;
				}
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

export default fp(wsRoutes, {
    name: 'wsRoutesPlugin',
    fastify: '5.x'
})