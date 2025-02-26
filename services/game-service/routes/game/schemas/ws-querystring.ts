export const wsQuerySchema = {
    "$id": "schema:game:ws:query",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "GameWsQuerySchema",
    "type": "object",
    "properties": {
		  "gameId": { "type": "string", "pattern": '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'},
		  "playerId": { "type": "string" }
		},
		"required": ["gameId", "playerId"]
} as const

// TODO: pattern for player_id