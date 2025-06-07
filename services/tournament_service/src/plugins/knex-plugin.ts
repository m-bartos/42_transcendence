import type {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import {dbSqlite} from "../services/knex-db-connection.js";

async function knexPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // First connection: SQLite

    // Decorate Fastify instance with both connections
    fastify.decorate('dbSqlite', dbSqlite);

    // Clean up on close
    fastify.addHook('onClose', async () => {
        await dbSqlite.destroy();
    });
}

export default fp(knexPlugin);
