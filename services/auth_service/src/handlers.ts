
import type {FastifyInstance, FastifyRequest, FastifyReply} from "fastify";


function createUser(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
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

function loginUser(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'loginUser'};
}

function logoutUser(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'logoutUser'};
}

function getUserInfo(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'getUserInfo'};
}

function refreshToken(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'refreshToken'};
}

function logoutAll(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'logoutAll'};
}

function getAllSessions(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'getAllSessions'};
}

function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'deleteUser'};
}

function updateUser(request: FastifyRequest, reply: FastifyReply) {
    return {endpoint: 'updateUser'};
}

export {createUser, loginUser, logoutUser, getUserInfo, refreshToken, logoutAll, getAllSessions, deleteUser, updateUser};