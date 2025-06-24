import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fp from 'fastify-plugin'
import fastifyWebsocket from '@fastify/websocket'

import { wsQuerySchema } from './schemas/ws-querystring.js';
import wsHandler from "../handlers/ws-handler.js";


const wsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    await fastify.register(fastifyWebsocket, {options: { maxPayload: 1024 }}); // INFO: Fastify do not execute wsHandler when there is no await

	fastify.addSchema(wsQuerySchema);

	fastify.route({
		method: 'GET',
		url: '/ws',
		schema: {
			querystring: fastify.getSchema("schema:game:ws:query")
		},
		preHandler: fastify.authenticateWsPreHandler,
		handler: (req, reply) => {
			reply.code(404).send();
		},
		wsHandler: wsHandler
	});
}

export default fp(wsRoutes, {
    name: 'wsRoutesPlugin',
    fastify: '5.x'
})