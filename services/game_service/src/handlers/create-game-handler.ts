import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {CreateGameBody, CreateGameResponse, GameType} from "../types/game.js";

async function createGameHandler (this: FastifyInstance, request: FastifyRequest<{Body: CreateGameBody}>, reply: FastifyReply): Promise<CreateGameResponse>  {
    try {
        console.log("test1")
        const game = this.gameManager.createGame(this.gameEventsPublisher, GameType.Multiplayer, request.body.playerOneSessionId, request.body.playerTwoSessionId);

        console.log("test2")

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
        console.log(error);
        reply.code(500);
        return {status: 'error', message: 'Internal server error.'};
    }
}

export default createGameHandler;