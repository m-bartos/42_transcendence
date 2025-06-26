import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fp from 'fastify-plugin';
import { gameManager } from "../services/game-manager.js";
import {
    tournamentDeleteSuccess200Response,
    tournamentGetAllTournamentsGetSuccess200Response, tournamentGetAllTournamentsQuery,
    tournamentPostBadRequest400Response,
    tournamentPostConflict409Response,
    tournamentPostRequestBody, tournamentPostServerError500Response,
    tournamentPostSuccess201Response, tournamentsEndedPostRequestBody
} from './schemas/http-schemas.js'
import createTournament from "../handlers/create-tournament.js";
import getActiveTournament from "../handlers/get-active-tournament.js";
import getAllTournaments from "../handlers/get-all-tournaments.js";
import deleteTournament from "../handlers/delete-tournament.js";
import getStatsOfTournament from "../handlers/get-stats-of-tournament.js";
import getAllTournamentsByUserId from "../handlers/get-all-tournaments-by-user-id.js";

const httpRoutes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
    fastify.addSchema(tournamentPostRequestBody);
    fastify.addSchema(tournamentPostSuccess201Response);
    fastify.addSchema(tournamentPostBadRequest400Response);
    fastify.addSchema(tournamentPostConflict409Response);
    fastify.addSchema(tournamentPostServerError500Response);
    fastify.addSchema(tournamentGetAllTournamentsQuery);
    fastify.addSchema(tournamentGetAllTournamentsGetSuccess200Response);
    fastify.addSchema(tournamentDeleteSuccess200Response);
    fastify.addSchema(tournamentsEndedPostRequestBody);

    fastify.route({
            method: 'GET',
            url: '/tournaments',
            preHandler: fastify.authenticate,
            handler: getAllTournaments,
            schema: {
                querystring: fastify.getSchema("schema:tournament:get:all:query"), //TODO: update the query schema
                response: {
                    200: fastify.getSchema('schema:tournament:get:all:tournaments:response200'),
                    500: fastify.getSchema('schema:tournament:post:response500'),
                }
            }
        }
    )

    fastify.route({
            method: 'POST',
            url: '/tournaments/ended',
            preHandler: fastify.authenticate,
            handler: getAllTournamentsByUserId,
            schema: {
                body: fastify.getSchema('schema:tournaments:ended:post:body'),
                response: {
                    200: fastify.getSchema('schema:tournament:get:all:tournaments:response200'),
                    500: fastify.getSchema('schema:tournament:post:response500'),
                }
            }
        }
    )

    fastify.route({
            method: 'GET',
            url: '/tournaments/:id',
            preHandler: fastify.authenticate,
            handler: getActiveTournament,
            schema: {
                response: {
                    200: fastify.getSchema('schema:tournament:post:response201'),
                    500: fastify.getSchema('schema:tournament:post:response500'),
                }
            }
        }
    )

    fastify.route({
            method: 'GET',
            url: '/tournaments/stats/:id',
            preHandler: fastify.authenticate,
            handler: getStatsOfTournament,
            // schema: {
            //     response: {
            //         200: fastify.getSchema('schema:tournament:post:response201'),
            //         500: fastify.getSchema('schema:tournament:post:response500'),
            //     }
            // }
        }
    )


    fastify.route({
            method: 'DELETE',
            url: '/tournaments/:id',
            preHandler: fastify.authenticate,
            handler: deleteTournament,
            schema: {
                response: {
                    200: fastify.getSchema('schema:tournament:delete:response200'),
                    500: fastify.getSchema('schema:tournament:post:response500'),
                }
            }
        }
    )

    fastify.route({
        method: 'POST',
        url: '/tournaments',
        preHandler: fastify.authenticate,
        handler: createTournament,
        schema: {
            body: fastify.getSchema('schema:tournament:post:body'),
            response: {
                201: fastify.getSchema('schema:tournament:post:response201'),
                409: fastify.getSchema('schema:tournament:post:response409'),
                500: fastify.getSchema('schema:tournament:post:response500'),
            }
        }
    })


};

export default fp(httpRoutes, {
    name: 'tournamentRoutes',
    fastify: '5.x',
})