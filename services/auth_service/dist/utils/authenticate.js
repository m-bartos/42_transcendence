async function authenticate(request, reply) {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.code(401);
        return reply.send({ status: 'error', message: 'missing or invalid authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = await request.server.jwt.verify(token);
        request.jwt_payload = decoded;
        request.session_id = decoded.jti;
    }
    catch (error) {
        if (error instanceof Error) {
            reply.code(401);
            return reply.send({ status: 'error', message: 'unauthorized' });
        }
        reply.code(500);
        return reply.send({ status: 'error', message: 'internal server error' });
    }
}
export default authenticate;
