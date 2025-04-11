import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {CreateGameBody, CreateGameResponse, GameType} from "../types/game.js";

async function createGameHandler (this: FastifyInstance, request: FastifyRequest<{Body: CreateGameBody}>, reply: FastifyReply): Promise<CreateGameResponse>  {
    try {
        const game = this.gameManager.createGame(this.gameEventsPublisher, GameType.Multiplayer, request.body.playerOneSessionId, request.body.playerTwoSessionId);

        reply.code(201);
        return {
            status: 'success',
            message: 'Game created successfully.',
            data: {
                gameId: game.id,
                created: game.created.toISOString()
            }
        };
    } catch (error) {
        reply.code(500);
        return {status: 'error', message: 'Internal server error.'};
    }
}

export default createGameHandler;