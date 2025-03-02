import { getUserId } from '../utils/dbQueries.js';
async function getUserInfo(request, reply) {
    try {
        const userId = await getUserId(this, request);
        if (!userId) {
            reply.code(401);
            return { status: 'error', message: 'session has expired.' };
        }
        reply.code(200);
        const userInfo = await this.dbSqlite('users').where({ id: userId.user_id, active: true }).first();
        return { status: 'success', message: 'user info.', data: userInfo };
    }
    catch (error) {
        reply.code(500);
        if (error instanceof Error)
            return { status: 'error', message: error.message };
        else
            return { status: 'error', message: 'internal server error' };
    }
}
export default getUserInfo;
