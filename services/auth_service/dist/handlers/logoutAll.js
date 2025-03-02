import { getUserId } from "../utils/dbQueries.js";
async function logoutAll(request, reply) {
    try {
        const userId = await getUserId(this, request);
        if (!userId) {
            reply.code(400);
            return { status: 'error', message: 'invalid session' };
        }
        const sessions = await this.dbSqlite('sessions').where('user_id', userId.user_id).update('revoked', true);
        if (!sessions) {
            reply.code(400);
            return { status: 'error', message: 'invalid session' };
        }
        reply.code(200);
        return { status: 'success', message: 'all sessions revoked' };
    }
    catch (error) {
        reply.code(500);
        if (error instanceof Error)
            return { status: 'error', message: error.message };
        return { status: 'error', message: 'internal server error' };
    }
}
export default logoutAll;
