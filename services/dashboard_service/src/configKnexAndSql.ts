import knex from 'knex';
import type { GameEndedSqlModel as GameResults } from './parseGameEndedMessage.js'
import type {GameEndedSqlModel} from "./parseGameEndedMessage.js";

export const dbSqlite = knex({
    client: 'sqlite3',
    connection: {
        filename: '/dashboard_data/dashboard_service.sqlite',
    },
    useNullAsDefault: true,
});

export async function insertGameResults(gameEndedData: GameEndedSqlModel): Promise<void> {
    try
    {
        await dbSqlite<GameResults>('game_results').insert(gameEndedData);
    }
    catch (error) {
        console.error("DB Error", error);
    }
}
