export async function getUserId(instance, request) {
    return instance.dbSqlite('sessions').select('user_id').where({ session_id: request.session_id, revoked: false }).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')").first();
}
