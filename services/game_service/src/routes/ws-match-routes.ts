import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from "fastify";
import fp from 'fastify-plugin'
import fastifyWebsocket from '@fastify/websocket'

import { wsQuerySchema } from './schemas/ws-querystring.js';
import wsMatchHandler from "../handlers/ws-match-handler.js";

interface WsQueryParams {
	playerJWT: string;
}

interface WebSocketRequest extends FastifyRequest {
	QueryString: WsQueryParams
}

const wsMatchRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

	// await fastify.register(fastifyWebsocket, {options: {maxPayload: 1024}});

	// fastify.addSchema(wsQuerySchema);

	fastify.route({
		method: 'GET',
		url: '/ws/match',
		schema: {
			querystring: fastify.getSchema("schema:game:ws:query")
		},
		preHandler: fastify.authenticateWsPreHandler,
		handler: (req, reply) => {
			reply.code(404).send();
		},
		wsHandler: wsMatchHandler
	});
}

export default fp(wsMatchRoutes, {
	name: 'wsRoutesMatchPlugin',
	fastify: '5.x'
})