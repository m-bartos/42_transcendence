async function loginUser(request, reply) {
    const { username, password } = request.body;
    try {
        const user = await this.dbSqlite('users').select('*').where({ username: username, password: password, active: true }).first();
        if (!user) {
            reply.code(401);
            return { status: 'error', message: 'Invalid username or password' };
        }
        const newSession = {
            user_id: user.id,
            session_id: crypto.randomUUID(),
            ip_address: request.ip || 'unknown',
            user_agent: request.headers['user-agent'] || 'unknown',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        try {
            await this.dbSqlite('sessions').insert(newSession);
            const token = this.jwt.sign({ jti: newSession.session_id });
            reply.code(200);
            return { status: 'success', message: 'user logged in', data: { token: token } };
        }
        catch (error) {
            reply.code(500);
            return { status: 'error', message: 'failed to create session' };
        }
    }
    catch (error) {
        const sqliteError = error;
        reply.code(500);
        return { status: 'error', message: sqliteError.message };
    }
}
export default loginUser;
