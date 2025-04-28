import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {CreateGameBody} from "../game-base/types/game.js";
import {CreateGameResponse} from "../types/create-game-response.js";

async function createGameHandler (this: FastifyInstance, request: FastifyRequest<{Body: CreateGameBody}>, reply: FastifyReply): Promise<CreateGameResponse>  {
    try {
        const game = this.gameManager.createGame(this.gameEventsPublisher, request.body.playerOneUserId, request.body.playerOneSessionId, request.body.playerTwoUserId, request.body.playerTwoSessionId);

        reply.code(201);
        return {
            status: 'success',
            message: 'Game created successfully.',
            data: {
                gameId: game.id,
                created: 'TODO: nebude tady',
            }
        };
    } catch (error) {
        console.error("Error in createGameHandler: ", error);
        reply.code(500);
        return {status: 'error', message: 'Internal server error.'};
    }
}

export default createGameHandler;