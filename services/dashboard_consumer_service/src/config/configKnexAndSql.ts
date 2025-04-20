import knex from 'knex';
import type { GameEndedSqlModelMulti } from "../utils/parseGameEndedMessageMulti.js";
import type { GameEndedSqlModelSplit } from "../utils/parserGameEndedMessageSplit.js";

const dbSqlite = knex({
    client: 'sqlite3',
    connection: {
        filename: '/dashboard_data/dashboard_service.sqlite',
    },
    useNullAsDefault: true,
});

export async function insertGameMultiplayerResults(gameEndedData: GameEndedSqlModelMulti): Promise<number> {
    const id: number[] = [];
    try
    {
        id[0] = await dbSqlite<GameEndedSqlModelMulti>('multiplayer_results').insert(gameEndedData);
    }
    catch (error) {
        console.error("DB Error", error);
    }
    return id[0];
}

export async function insertGameSplitResults(gameEndedData: GameEndedSqlModelSplit): Promise<number> {
    const id: number[] = [];
    try
    {
        id[0] = await dbSqlite<GameEndedSqlModelSplit>('split_keyboard_results').insert(gameEndedData)
    }
    catch (error) {
        console.error("DB Error", error);
    }
    return id[0];
}
