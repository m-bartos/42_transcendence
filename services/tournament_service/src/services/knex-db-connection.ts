import knex from "knex";

export const dbSqlite = knex({
    client: 'sqlite3',
    connection: {
        filename: '/tournament_db_data/tournament_service.sqlite',
    },
    useNullAsDefault: true,
});