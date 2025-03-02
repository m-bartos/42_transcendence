import { getUserId } from "../utils/dbQueries.js";
async function updateUser(request, reply) {
    const { username, password, email } = request.body;
    try {
        const userId = await getUserId(this, request);
        if (userId) {
            const updated = await this.dbSqlite('users').update({ 'username': username, 'email': email, 'password': password });
            if (updated) {
                reply.code(200);
                return { status: 'success', message: 'user updated successfully.' };
            }
            reply.code(400);
            return { status: 'error', message: 'user update failed.' };
        }
        reply.code(400);
        return { status: 'error', message: 'user not found' };
    }
    catch (error) {
        if (error instanceof Error) {
            reply.code(500);
            return { status: 'error', message: error.message };
        }
        return { status: 'error', message: 'internal server error' };
    }
}
export default updateUser;
