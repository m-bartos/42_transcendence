export const createResponseSchema = {
    "$id": "schema:game:create:response201",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameCreateSuccess201Response",
    "type": "object",
    "properties": {
        "status": { "type": "string", "enum": ["success"] },
        "data": {
            "type": "object",
            "properties": {
                "gameId": { "type": "string" },
                "created": { "type": "string", "format": "date-time" }
            },
            "required": ["gameId", "created"]
        }
    },
    "required": ["status", "data"]
} as const

export const responseError500Schema = {
    $id: 'schema:game:response500',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Error500Response',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string' },
    },
    required: ['status', 'message'],
} as const
