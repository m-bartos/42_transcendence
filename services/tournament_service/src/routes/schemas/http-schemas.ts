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

export const tournamentDeleteSuccess200Response = {
    "$id": "schema:tournament:delete:response200",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "TournamentDeleteResponse200",
    // "type": "object",
    // "properties": {}
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
            "required": ["id", "status", "name", "games"]
        }
    },
    "required": ["status", "message", "data"]
} as const

export const tournamentGetAllTournamentsQuery = {
    "$id": "schema:tournament:get:all:query",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "TournamentGetAllTournamentsQuery",
    "type": "object",
    "properties": {
        "status": { "type": "string", "enum": ["active", "finished", "pending"]  }
    },
    "required": ["status"]
} as const


export const tournamentGetAllTournamentsGetSuccess200Response = {
    "$id": "schema:tournament:get:all:tournaments:response200",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "TournamentGetAllTournamentsResponse200",
    "type": "object",
    "properties": {
        "status": {
            "type": "string",
            "enum": ["success"]
        },
        "message": {
            "type": "string",
            "description": "Optional message providing additional context (e.g., 'No active tournaments found')."
        },
        "data": {
            "type": "array",
            "description": "Array of active tournaments, which may be empty if none exist.",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "description": "Unique identifier for the tournament."
                    },
                    "name": {
                        "type": "string",
                        "description": "Name of the tournament."
                    },
                    "created": {
                        "type": "string",
                        "format": "date-time",
                        "description": "Timestamp when the tournament was created (ISO 8601 format)."
                    }
                },
                "required": ["id", "name", "created"],
                "additionalProperties": false
            }
        }
    },
    "required": ["status", "message", "data"],
    "additionalProperties": false
} as const

