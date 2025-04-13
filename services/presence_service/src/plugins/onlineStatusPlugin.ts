import {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import { reportUserOnlineStatus } from "../statusReporting/reportUserOnlineStatus.js";

async function onlineStatusPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
    // Register interval plugin to check online users plugin with configuration
    fastify.register(reportUserOnlineStatus);
}

export default fp(onlineStatusPlugin)