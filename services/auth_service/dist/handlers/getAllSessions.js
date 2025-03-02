async function getAllSessions(request, reply) {
    try {
        const userId = await this.dbSqlite('sessions').select('user_id').where({ session_id: request.session_id, revoked: false }).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')").first();
        if (!userId) {
            reply.code(401);
            return { status: 'error', message: 'session has expired.' };
        }
        const sessions = await this.dbSqlite.select('*').from('sessions').where({ user_id: userId.user_id, revoked: false }).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')");
        if (!sessions.length) {
            reply.code(401);
            return { status: 'error', message: 'session has expired' };
        }
        const response = {
            status: 'success',
            count: sessions.length,
            message: `sessions retrieved`,
            data: sessions,
        };
        reply.code(200);
        return response;
    }
    catch (error) {
        reply.code(500);
        if (error instanceof Error) {
            const sqliteError = error;
            return { status: 'error', message: sqliteError.message };
        }
        return { status: "error", message: "internal server error" };
    }
}
export default getAllSessions;
