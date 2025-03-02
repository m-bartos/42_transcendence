async function authenticate(request, reply) {
    try {
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            reply.code(401);
            throw new Error('Missing or invalid Authorization header');
        }
        const token = authHeader.split(' ')[1];
        request.user = request.server.jwt.verify(token);
    }
    catch (error) {
        reply.code(401).send({ status: 'error', message: error instanceof Error ? error.message : 'Unauthorized'
        });
    }
}
export default authenticate;
