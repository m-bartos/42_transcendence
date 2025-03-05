import fp from 'fastify-plugin';
import knex from 'knex';
async function knexPlugin(fastify, options) {
    // First connection: SQLite
    const dbSqlite = knex({
        client: 'sqlite3',
        connection: {
            filename: '//sqlite_db_data/auth_service.sqlite',
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
