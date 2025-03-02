async function createUser(request, reply) {
    try {
        const { username, email, password } = request.body;
        const [id] = await this.dbSqlite('users').insert({ username, email, password });
        reply.code(201);
        return { status: 'success', message: 'User created successfully.', data: { id, username, email }
        };
    }
    catch (error) {
        const sqliteError = error;
        if (sqliteError.code === 'SQLITE_CONSTRAINT') {
            reply.code(409);
            return { status: 'error', message: 'duplicate error', conflict: sqliteError.message };
        }
        else {
            reply.code(400);
            return { status: 'error', message: sqliteError.message };
        }
    }
}
export default createUser;
