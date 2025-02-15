// @ts-ignore
import { createUser, loginUser, logoutUser, getUserInfo, refreshToken, logoutAll, getAllSessions, deleteUser, updateUser } from './handlers.js';
export const routes = [
    {
        // create user
        url: '/api/user',
        method: 'post',
        handler: createUser,
    },
    {
        // login user
        url: '/api/login',
        method: 'post',
        handler: loginUser
    },
    {
        // logout user
        url: '/api/logout',
        method: 'post',
        handler: logoutUser
    },
    {
        // user details
        url: '/api/user/info',
        method: 'get',
        handler: getUserInfo,
    },
    {
        // refresh jwt token
        url: '/api/user/refresh',
        method: 'post',
        handler: refreshToken,
    },
    {
        // logout all user sessions
        url: '/api/sessions/logout/all',
        method: 'delete',
        handler: logoutAll,
    },
    {
        // list all users sessions
        url: '/api/sessions',
        method: 'get',
        handler: getAllSessions
    },
    {
        // deactivate user
        url: '/api/user',
        method: 'delete',
        handler: deleteUser
    },
    {
        // update user profile data
        url: '/api/user',
        method: 'patch',
        handler: updateUser
    }
];
