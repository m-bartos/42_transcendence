import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify'

async function getAllGames (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply)
{

    const gameEndObj = {
        "event": "game.end",
        "gameId": "4758dcc5-2598-4983-9cd3-9717b9364de6",
        "timestamp": "2025-04-04T20:34:26.095Z",
        "data": {
            "gameId": "4758dcc5-2598-4983-9cd3-9717b9364de6",
            "gameType": "multiplayer",
            "endCondition": "scoreLimit",
            "playerOne": {
                "id": 329,
                "score": 2,
                "paddleBounce": 3
            },
            "playerTwo": {
                "id": 21,
                "score": 10,
                "paddleBounce": 1
            },
            "created": "2025-04-04T20:33:54.272Z",
            "started": "2025-04-04T20:33:54.368Z",
            "ended": "2025-04-04T20:34:26.095Z",
            "duration": 31.727,
            "winnerId": 21
        }
    }

    this.gameEventsPublisher.sendEvent('game.start', JSON.stringify({gameId: 1234, timeStamp: Date.now()}));
    this.gameEventsPublisher.sendEvent('game.end', JSON.stringify(gameEndObj));
    reply.code(200);
    return {gameEndObj};
}



export default getAllGames;