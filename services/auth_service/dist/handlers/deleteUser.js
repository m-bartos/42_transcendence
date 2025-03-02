import { getUserId } from '../utils/dbQueries.js';
async function deleteUser(request, reply) {
    try {
        const userId = await getUserId(this, request);
        if (userId) {
            const deactivateSessions = await this.dbSqlite('sessions').where('user_id', userId.user_id).update({ revoked: true });
            const userDetails = await this.dbSqlite('users').select('username', 'email').where('id', userId.user_id).first();
            const deactivateUser = await this.dbSqlite('users').where('id', userId.user_id).update({ active: false, username: userDetails.username + userId.user_id, email: userDetails.email + userId.user_id });
            if (deactivateSessions && deactivateUser) {
                reply.code(200);
                return { status: 'success', message: `user deactivated` };
            }
        }
        reply.code(400);
        return { status: 'error', message: `invalid deactivation` };
    }
    catch (error) {
        reply.code(500);
        if (error instanceof Error) {
            return { status: 'error', message: error.message };
        }
        return { status: 'error', message: 'internal server error' };
    }
}
export default deleteUser;
