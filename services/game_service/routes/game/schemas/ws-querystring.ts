export const wsQuerySchema = {
    "$id": "schema:game:ws:query",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameWsQuerySchema",
    "type": "object",
    "properties": {
		  "playerJWT": { "type": "string" }
		},
		"required": ["playerJWT"]
} as const

// TODO: pattern for player_id