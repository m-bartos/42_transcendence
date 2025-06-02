import {FastifyInstance, FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin'
import createUser from '../handlers/createUser.js'
import loginUser from '../handlers/loginUser.js'
import getAllSessions from '../handlers/getAllSessions.js'
import logoutUser from '../handlers/logoutUser.js'
import getUserInfo from '../handlers/getUserInfo.js'
import deleteUser from '../handlers/deleteUser.js'
import updateUser from '../handlers/updateUser.js'
import refreshToken from '../handlers/refreshToken.js'
import logoutAll from '../handlers/logoutAll.js'
import updateUserAvatarLink from '../handlers/updateUserAvatarLink.js'
import updateUserPassword from '../handlers/updateUserPassword.js'
import getUserInfoById from "../handlers/getUserInfoById.js";
import findUsersByUsername from "../handlers/findUsersByUsername.js";

const routesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
    const routes = [
        {
            // create user
            url: '/user',
            method: 'post',
            handler: createUser,
            schema: {
                body: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/body.json'),
                response: {
                    201: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/response-201.json'),
                    409: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/response-409.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/response-500.json'),
                }
            }
        },
        {
            // login user
            url: '/login',
            method: 'post',
            handler: loginUser,
            schema: {
                body: fastify.getSchema('https://ponggame.com/schemas/api/v1/login/body.json'),
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/login/response-200.json'),
                    //400: fastify.getSchema('https://ponggame.com/schemas/api/v1/login/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/login/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/login/response-500.json'),
                }
            }
        },
        {
            // logout user
            url: '/logout',
            method: 'post',
            preHandler: fastify.authenticate,
            handler: logoutUser,
            schema: {
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/logout/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/logout/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/logout/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/logout/response-500.json')
                }
            }
        },
        {
            // user details
            url: '/user/info',
            method: 'get',
            preHandler: fastify.authenticate,
            handler: getUserInfo,
            schema: {
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/info/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/info/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/info/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/info/response-500.json')
                }
            }
        },
        {
            // refresh jwt token
            url: '/user/refresh',
            method: 'post',
            preHandler: fastify.authenticate,
            handler: refreshToken,
            schema: {
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/refresh/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/refresh/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/refresh/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/refresh/response-500.json'),
                }
            }
        },
        {
            // logout all user sessions
            url: '/sessions/logout/all',
            method: 'delete',
            preHandler: fastify.authenticate,
            handler: logoutAll,
            schema: {
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/sessions/logoutAll/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/sessions/logoutAll/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/sessions/logoutAll/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/sessions/logoutAll/response-500.json')
                }
            }
        },
        {
            // list all users sessions
            url: '/sessions',
            method: 'get',
            preHandler: fastify.authenticate,
            handler: getAllSessions,
            schema: {
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/sessions/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/sessions/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/sessions/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/sessions/response-500.json')
                }
            }
        },
        {
            // deactivate user
            url: '/user',
            method: 'delete',
            preHandler: fastify.authenticate,
            handler: deleteUser,
            schema: {
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/delete/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/delete/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/delete/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/delete/response-500.json')
                }
            }
        },
        {
            // update user profile data
            url: '/user',
            method: 'patch',
            preHandler: fastify.authenticate,
            handler: updateUser,
            schema: {
                body: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/patch/body.json'),
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/patch/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/patch/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/patch/response-401.json'),
                    409: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/patch/response-409.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/patch/response-500.json')
                }
            }
        },
        {
            // update user profile data - link to avatar - internal endpoint!!!!
            url: '/user/internal/avatar',
            method: 'post',
            handler: updateUserAvatarLink,
            schema: {
                body: fastify.getSchema('https://ponggame.com/schemas/api/v1/avatra/post/body.json'),
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/avatar/post/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/avatar/post/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/avatar/post/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/avatar/post/response-500.json')
                }
            }
        },
        {
            url: '/user/password',
            method: 'patch',
            preHandler: fastify.authenticate,
            handler: updateUserPassword,
            schema: {
                body: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/password/body.json'),
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/password/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/password/response-400.json'),
                    401: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/password/response-401.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/user/password/response-500.json')
                }
            }
        },
        {
            url: '/user/info',
            method: 'post',
            preHandler: fastify.authenticate,
            handler: getUserInfoById,
            schema: {
                body: fastify.getSchema('https://ponggame.com/schemas/api/v1/getUserInfoInternal/body.json'),
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/getUserInfoInternal/response-200.json'),
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/getUserInfoInternal/response-400.json'),
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/getUserInfoInternal/response-500.json')
                }
            }
        },
        {
            url: '/user/find',
            method: 'get',
            preHandler: fastify.authenticate,
            handler: findUsersByUsername,
            schema: {
                querystring: fastify.getSchema('https://ponggame.com/schemas/api/v1/findUserByUsername/query.json'),
                response: {
                    200: fastify.getSchema('https://ponggame.com/schemas/api/v1/getUserInfoInternal/response-200.json'), // from getUser endpoint
                    400: fastify.getSchema('https://ponggame.com/schemas/api/v1/getUserInfoInternal/response-400.json'), // from getUser endpoint
                    500: fastify.getSchema('https://ponggame.com/schemas/api/v1/getUserInfoInternal/response-500.json') // from getUser endpoint
                }
            }
        }
    ];
    routes.forEach(route => {
        fastify.route(route);
    });
}

export default fp(routesPlugin);