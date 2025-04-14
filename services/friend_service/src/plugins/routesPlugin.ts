import type {FastifyInstance, FastifyPluginOptions ,FastifyRequest, FastifyReply} from "fastify";
import { getAllFriends } from '../handlers/getAllFriends.js';
import { addSingleFriend } from '../handlers/addSingleFriend.js'
import { removeSingleFriend } from '../handlers/removeSingleFriend.js';
import fp from 'fastify-plugin';
import authenticate from "../utils/authenticate.js";
async function routePlugin(fastify: FastifyInstance, opts : FastifyPluginOptions) {
    const getFriend = {
        method: 'GET',
        url: '/friend',
        preHandler: authenticate,
        handler: getAllFriends,
    };


    const addFriend = {
        method: 'POST',
        url: '/friend',
        preHandler: authenticate,
        handler: addSingleFriend,
        schema: {
            body: fastify.getSchema('https://ponggame.com/schemas/api/v1/friend/add/body.json'),
            response: {
                201: fastify.getSchema('https://ponggame.com/schemas/api/v1/friend/add/response-201.json')
            }
        }
    };


    const removeFriend = {
        method: 'DELETE',
        url: '/friend',
        preHandler: authenticate,
        handler: removeSingleFriend,
    };

    fastify.route(getFriend);
    fastify.route(addFriend);
    fastify.route(removeFriend);
}

export default fp(routePlugin);