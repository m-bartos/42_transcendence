function refreshToken(request, reply) {
    return { endpoint: 'refreshToken' };
}
function logoutAll(request, reply) {
    return { endpoint: 'logoutAll' };
}
function deleteUser(request, reply) {
    return { endpoint: 'deleteUser' };
}
function updateUser(request, reply) {
    return { endpoint: 'updateUser' };
}
export { refreshToken, logoutAll, deleteUser, updateUser };
