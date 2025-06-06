import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify'

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max) + 1;
}

function determineGameType()
{
    const seed = getRandomInt(20);
    if (seed > 10)
    {
        return 'multiplayer';
    }
    else if (seed <= 10 && seed > 4)
    {
        return 'tournament';
    }
    else
        return 'splitKeyboard'
}

function generateTimestamps() {
    const createdDate = new Date();
    const startedDate = new Date(createdDate.getTime() + getRandomInt(100)); // adding 1 - ~100ms
    const endedDate = new Date(startedDate.getTime() + (getRandomInt(60) * (1000 + getRandomInt(99)))); // adding random game time
   // const duration = endedDate.getTime() - startedDate.getTime();
    return {
        created: createdDate.toISOString(),
        started: startedDate.toISOString(),
        ended: endedDate.toISOString(),
        duration: (endedDate.getTime() - startedDate.getTime()) / 1000
    };
}



async function publishEndGameMultiplayer (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply)
{
    // mockup val generation
    let playerOneScore: number = getRandomInt(10);
    const playerTwoScore: number = getRandomInt(10);
    while (playerOneScore === playerTwoScore) {
        playerOneScore = getRandomInt(10);
    }

    const playerOneId: number = getRandomInt(5);
    let playerTwoId: number = getRandomInt(5);
    while (playerTwoId === playerOneId) {
        playerTwoId = getRandomInt(5);
    }

    function determineWinnerId(): number
    {
        return playerOneScore > playerTwoScore ? playerOneId : playerTwoId;
    }

    const gameId = crypto.randomUUID();

    function determineEndCondition()
    {
        if (playerOneScore === 10 || playerTwoScore === 10)
        {
            return 'scoreLimit';
        }
        else if (playerTwoScore + playerOneScore > 10)
        {
            return 'playerLeft'
        }
        return 'timeout';
    }

    const timeStamps = generateTimestamps();

    // endpoint
    const gameEndObj = {
        "event": "game.end.multi",
        "gameId": gameId,
        "timestamp": timeStamps.ended,
        "data": {
            "gameId": gameId,
            "gameType": 'multiplayer',
            "endCondition": determineEndCondition(),
            "playerOne": {
                "id": playerOneId,
                "score": playerOneScore,
                "paddleBounce": getRandomInt(50),
            },
            "playerTwo": {
                "id": playerTwoId,
                "score": playerTwoScore,
                "paddleBounce": getRandomInt(50)
            },
            "created": timeStamps.created,
            "started": timeStamps.started,
            "ended": timeStamps.ended,
            "duration": timeStamps.duration,
            "winnerId": determineWinnerId()
        }
    }
    this.gameEventsPublisher.sendEvent('game.end.multi', JSON.stringify(gameEndObj));
    reply.code(200);
    return {status: 'success', message: "multiplayer end game event published", data: gameEndObj};
}



export default publishEndGameMultiplayer;