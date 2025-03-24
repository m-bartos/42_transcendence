export const createBodySchema = {
    "$id": "schema:game:create:body",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameCreateBody",
    "type": "object",
    "properties": {
        "playerOneSessionId": { "type": "string", "format": "uuid" },
        "playerTwoSessionId": { "type": "string", "format": "uuid" },
    },
    "required": ["playerOneSessionId", "playerTwoSessionId"]
} as const;