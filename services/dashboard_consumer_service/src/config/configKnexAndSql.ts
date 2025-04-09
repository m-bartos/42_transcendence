import knex from 'knex';
import type { GameEndedSqlModel as GameResults } from '../utils/parseGameEndedMessage.js'
import type { GameEndedSqlModel } from "../utils/parseGameEndedMessage.js";

const dbSqlite = knex({
    client: 'sqlite3',
    connection: {
        filename: '/dashboard_data/dashboard_service.sqlite',
    },
    useNullAsDefault: true,
});

export async function insertGameResults(gameEndedData: GameEndedSqlModel): Promise<number> {
    const id: number[] = [];
    try
    {
        id[0] = await dbSqlite<GameResults>('game_results').insert(gameEndedData);
    }
    catch (error) {
        console.error("DB Error", error);
    }
    return id[0];
}
