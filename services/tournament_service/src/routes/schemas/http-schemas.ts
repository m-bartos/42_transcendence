export const tournamentPostRequestBody = {
        $id: 'schema:tournament:post:body',
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'TournamentPostRequestBody',
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 3, maxLength: 30 },
            usernames: {type: 'array',
                items: {
                    type: 'string',
                    minLength: 3,
                    maxLength: 20
                },
                minItems: 3,
                maxItems: 6
            }
        },
        required: ['name','usernames'],
        additionalProperties: false
}

export const tournamentPostBadRequest400Response = {
    $id: 'schema:tournament:post:response400',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'tournamentPostBadRequest400Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};

export const tournamentPostConflict409Response = {
    $id: 'schema:tournament:post:response409',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'TournamentPostConflict409Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
        conflict: { type: 'string' },
    },
    required: ['status', 'message', 'conflict'],
};

export const tournamentPostServerError500Response = {
    $id: 'schema:tournament:post:response500',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'TournamentPostServerError500Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
};



export const tournamentPostSuccess201Response = {
    "$id": "schema:tournament:post:response201",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "TournamentPostResponse201",
    "type": "object",
    "properties": {
        "status": { "type": "string", "enum": ["success"] },
        "message": { "type": "string" },
        "data": {
            "type": "object",
            "properties": {
                "id": { "type": "integer" },
                "name": { "type": "string" },
                "games": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "integer" },
                            "gameId": { "type": "string", "format": "uuid" },
                            "status": { "type": "string", "enum": ["pending", "live", "ended"] },
                            "endReason": { "type": ["string", "null"], "enum": ["scoreLimit", "error", "timeout", "playerLeft"] },
                            "playerOneUsername": { "type": "string" },
                            "playerTwoUsername": { "type": "string" },
                            "playerOneScore": { "type": "integer" },
                            "playerTwoScore": { "type": "integer" },
                            "playerOnePaddleBounce": { "type": "integer" },
                            "playerTwoPaddleBounce": { "type": "integer" },
                            "winnerUsername": { "type": ["string", "null"] },
                            "loserUsername": { "type": ["string", "null"] },
                            "duration": { "type": ["number", "null"] }
                        },
                        "required": [
                            "id",
                            "gameId",
                            "status",
                            "playerOneUsername",
                            "playerTwoUsername",
                            "playerOneScore",
                            "playerTwoScore",
                            "playerOnePaddleBounce",
                            "playerTwoPaddleBounce",
                            "winnerUsername",
                            "loserUsername",
                            "duration"
                        ]
                    }
                }
            },
            "required": ["id", "name", "games"]
        }
    },
    "required": ["status", "message", "data"]
} as const