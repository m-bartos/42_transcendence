export const createBodySchema = {
    "$id": "schema:game:create:body",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameCreateBody",
    "type": "object",
    "properties": {
        "player1_id": { "type": "string" },
        "player2_id": { "type": "string" }
    },
    "required": ["player1_id", "player2_id"]
} as const;