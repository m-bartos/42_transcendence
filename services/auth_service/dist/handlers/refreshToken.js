import { getUserId } from '../utils/dbQueries.js';
async function refreshToken(request, reply) {
    try {
        const userId = await getUserId(this, request);
        if (!userId) {
            reply.code(400);
            return { status: 'error', message: 'invalid token' };
        }
        const user = await this.dbSqlite('users').where({ 'id': userId.user_id, 'active': true }).first();
        if (!user) {
            reply.code(400);
            return { status: 'error', message: 'invalid token' };
        }
        const token = this.jwt.sign({ jti: request.session_id });
        reply.code(200);
        return { status: 'success', message: 'new token', data: { token } };
    }
    catch (error) {
        if (error instanceof Error) {
            reply.code(500);
            return { status: 'error', message: error.message };
        }
        return { status: 'error', message: 'internal server error' };
    }
}
export default refreshToken;
