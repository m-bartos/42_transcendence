
import type {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";


function refreshToken(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'refreshToken'};
}

function logoutAll(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'logoutAll'};
}


function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'deleteUser'};
}

function updateUser(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'updateUser'};
}

export {refreshToken, logoutAll, deleteUser, updateUser};