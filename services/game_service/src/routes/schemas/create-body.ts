export const createBodySchema = {
    "$id": "schema:game:create:body",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameCreateBody",
    "type": "object",
    "properties": {
        "playerOneUserId": { "type": "string" },
        "playerOneSessionId": { "type": "string", "format": "uuid" },
        "playerTwoUserId": { "type": "string" },
        "playerTwoSessionId": { "type": "string", "format": "uuid" },
    },
    "required": ["playerOneUserId", "playerOneSessionId", "playerTwoUserId", "playerTwoSessionId"]
} as const;