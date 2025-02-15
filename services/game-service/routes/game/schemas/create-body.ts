export const createBodySchema = {
    "type": "object",
    "$id": "schema:game:create:body",
    "required": [
        "player1_id",
        "player2_id"
    ],
    "additionalProperties": false,
    "properties": {
        "player1_id": {
            "type": "string"
        },
        "player2_id": {
            "type": "string"
        }
    }
} as const;