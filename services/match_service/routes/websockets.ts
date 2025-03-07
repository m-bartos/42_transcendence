import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from "fastify";
import fp from 'fastify-plugin'
import fastifyWebsocket from '@fastify/websocket'

import { MatchWebSocket } from "../types/match.js";

import * as crypto from 'crypto';
// import { wsQuerySchema } from './schemas/ws-querystring.js';


declare module 'fastify' {
	interface FastifyInstance {
		deleteTimeoutedMatches: ReturnType<typeof setInterval>;
		broadcastState: ReturnType<typeof setInterval>;
		makeMatches: ReturnType<typeof setInterval>;
		broadcastStateOfMatchmakingService: ReturnType<typeof setInterval>;
	}
}

// interface WebSocketRequest extends FastifyRequest {
// 	QueryString: WsQueryParams
// }

const ws_plugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

	await fastify.register(fastifyWebsocket, {options: {maxPayload: 1024}});

	// Start periodic timeout check
	fastify.decorate('deleteTimeoutedMatches', setInterval(() => {
		fastify.matchManager.deleteTimeoutedMatches(fastify);
	}, 1800 * 1000));


	fastify.decorate('makeMatches', setInterval(() => {
		fastify.matchManager.createMatchesFromPlayerQueue();
	}, 1000))

	fastify.decorate('broadcastState', setInterval(() => {
		fastify.matchManager.broadcastStates();
	}, 500))

	fastify.decorate('broadcastStateOfMatchmakingService', setInterval(() => {
		fastify.matchManager.broadcastStateOfMatchmakingService();
	}, 500))

	// Clean up on plugin close
	fastify.addHook('onClose', (instance, done) => {
		clearInterval(fastify.deleteTimeoutedMatches);
		fastify.matchManager.closeAllWebSockets();
		done()
	});

	// fastify.addSchema(wsQuerySchema);

	fastify.route({
		method: 'GET',
		url: '/api/matchmaking/ws',
		// schema: {
		// 	querystring: fastify.getSchema("schema:game:ws:query")
		// },
		handler: (req, reply) => {
			reply.code(404).send();
		},
		wsHandler: function (origSocket, req) {
			// on connection
			const socket = origSocket as MatchWebSocket;
			socket.connectionId = crypto.randomUUID();
			socket.jwt = null;
			socket.sessionId = null;
			const self = this;

			socket.on('message', async function (rawData) {
				try {
					const message = JSON.parse(rawData.toString());
					if (message.type === 'auth') {
						const sessionId = await fastify.authenticateWS(fastify, message.token);
						if (sessionId) {
							socket.sessionId = sessionId;
							socket.jwt = message.token;
							self.matchManager.addToQueue(socket); // Use local reference
							// socket.send('authorized');
						} else {
							throw new Error('Authentication failed');
						}
					} else {
						socket.send('unauthorized');
						socket.close();
					}
				} catch (error) {
					socket.send('unauthorized');
					self.log.error(error); // Optional chaining if log might be undefined
					socket.close();
				}
			});
		}
	})
}

export default fp(ws_plugin, {
	name: 'ws_plugin',
	fastify: '5.x'
})