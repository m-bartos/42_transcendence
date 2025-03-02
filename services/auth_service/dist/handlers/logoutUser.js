async function logoutUser(request, reply) {
    try {
        const session = await this.dbSqlite('sessions').where({ session_id: request.session_id, revoked: false }).andWhereRaw("UNIXEPOCH(expires_at) > UNIXEPOCH('now')").update({ revoked: true });
        if (!session) {
            reply.code(401);
            return { status: 'error', message: 'session has expired' };
        }
        reply.code(200);
        return { status: 'success', message: 'successfully logged out.' };
    }
    catch (error) {
        reply.code(500);
        if (error instanceof Error) {
            const sqliteError = error;
            return { status: 'error', message: sqliteError.message };
        }
        return { status: 'error', message: 'internal server error' };
    }
}
export default logoutUser;
