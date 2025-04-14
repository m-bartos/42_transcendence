import type {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import knex from 'knex';

async function knexPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // First connection: SQLite
    const dbSqlite = knex({
        client: 'sqlite3',
        connection: {
            filename: '/friends_db_data/friends_service.sqlite',
        },
        useNullAsDefault: true,
    });

    // Decorate Fastify instance with both connections
    fastify.decorate('dbSqlite', dbSqlite);

    // Clean up on close
    fastify.addHook('onClose', async () => {
        await dbSqlite.destroy();
    });
}

export default fp(knexPlugin);
