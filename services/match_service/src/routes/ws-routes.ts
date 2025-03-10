import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from "fastify";
import fp from 'fastify-plugin'
import fastifyWebsocket from '@fastify/websocket'

import * as crypto from 'crypto';
import { wsQuerySchema } from './schemas/ws-querystring.js';
import {MatchWebSocket} from "../types/websocket.js";

interface WsQueryParams {
	playerJWT: string;
}

interface WebSocketRequest extends FastifyRequest {
	QueryString: WsQueryParams
}

const wsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

	await fastify.register(fastifyWebsocket, {options: {maxPayload: 1024}});

	fastify.addSchema(wsQuerySchema);

	fastify.route({
		method: 'GET',
		url: '/ws',
		schema: {
			querystring: fastify.getSchema("schema:matchmaking:ws:query")
		},
		preHandler: fastify.authenticateWsPreHandler,
		handler: (req, reply) => {
			console.log('test match http handler in ws')
			reply.code(404).send();
		},
		wsHandler: async function (origSocket, req) {
			const socket = origSocket as MatchWebSocket;
			if (req.session_id !== undefined)
			{
				socket.sessionId = req.session_id;
			}
			socket.connectionId = crypto.randomUUID();
			this.matchManager.addToQueue(socket);
		}
	});
}

export default fp(wsRoutes, {
	name: 'wsRoutesPlugin',
	fastify: '5.x'
})