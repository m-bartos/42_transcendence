import type {FastifyInstance, FastifyPluginOptions} from "fastify";
import fp from 'fastify-plugin';
import knex from 'knex';

async function knexPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // First connection: SQLite
    const dbSqlite = knex({
        client: 'sqlite3',
        connection: {
            filename: '//sqlite_db_data/auth_service.sqlite',
        },
        useNullAsDefault: true,
    });

    // Second connection: Postgres
    // Adjust connection details as needed
    const dbPg = knex({
        client: 'pg',
        connection: {
            host: 'auth_service_db',
            port: 5432,
            user: 'auth_user',
            password: 'securepassword',
            database: 'auth_db',
        },
    });

    // Decorate Fastify instance with both connections
    fastify.decorate('dbSqlite', dbSqlite);
    fastify.decorate('dbPg', dbPg);

    // Clean up on close
    fastify.addHook('onClose', async () => {
        await dbSqlite.destroy();
        await dbPg.destroy();
    });
}

export default fp(knexPlugin);
