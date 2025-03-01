export const createBodySchema = {
    "$id": "schema:game:create:body",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameCreateBody",
    "type": "object",
    "properties": {
        "player1Id": { "type": "string" },
        "player2Id": { "type": "string" }
    },
    "required": ["player1Id", "player2Id"]
} as const;