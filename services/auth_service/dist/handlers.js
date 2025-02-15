function createUser(request, reply) {
    reply.code(201);
    // @ts-ignore
    return {
        status: "success",
        message: "user created successfully",
        data: {
            id: 1,
            // @ts-ignore
            username: request.body.username,
            // @ts-ignore
            email: request.body.email,
        }
    };
}
function loginUser(request, reply) {
    return { endpoint: 'loginUser' };
}
function logoutUser(request, reply) {
    return { endpoint: 'logoutUser' };
}
function getUserInfo(request, reply) {
    return { endpoint: 'getUserInfo' };
}
function refreshToken(request, reply) {
    return { endpoint: 'refreshToken' };
}
function logoutAll(request, reply) {
    return { endpoint: 'logoutAll' };
}
function getAllSessions(request, reply) {
    return { endpoint: 'getAllSessions' };
}
function deleteUser(request, reply) {
    return { endpoint: 'deleteUser' };
}
function updateUser(request, reply) {
    return { endpoint: 'updateUser' };
}
export { createUser, loginUser, logoutUser, getUserInfo, refreshToken, logoutAll, getAllSessions, deleteUser, updateUser };
