# Matchmaking Service

This service provides
- Match creation for two random players


## Endpoints
See routes folder for detailed route definitions and request/response schemas
1) /api/games - POST - create game


## Matchmaking and game logic
![Transcendence](https://github.com/user-attachments/assets/6afb2fd6-fddf-429b-a810-dfcb9883f119)

## Game-service coordinate system
![Coordinate_system](https://github.com/m-bartos/42_transcendence/blob/feat/matchmaking-game/services/game-service/docs/Coordinate_system.svg)

## Connecting to game websocket
- using query parameters - gameId and playerId, such as:
```
URL/api/games/ws?gameId=0b879657-b318-4159-b663-882d97f689dd&playerId=test2
```
- POSSIBLE CHANGES IN THE FUTURE (route, playerId format etc.)

## Websocket communication
### Server
- JSON schema that is send by server through websocket can be found in [ws-liveMessage](https://github.com/m-bartos/42_transcendence/blob/feat/matchmaking-game/services/game-service/routes/game/schemas/ws-liveMessage.ts)


1) Pending message - before game start, when paused
   - sending every 500 ms
```
{
  "status": "pending",
  "paddleOne": {
    "yCenter": 50,
    "height": 15,
    "width": 2
  },
  "paddleTwo": {
    "yCenter": 50,
    "height": 15,
    "width": 2
  },
  "ball": {
    "x": 37.51,
    "y": 50.00000000000001,
    "semidiameter": 1
  },
  "playerOneScore": 1,
  "playerTwoScore": 4,
  "timestamp": 1740572445111
}
```

2) Live message - both players connected, playing
   - sending every 1/60 second
   - example of two messages:
```
{
  "status": "live",
  "paddleOne": {
    "yCenter": 50,
    "height": 15,
    "width": 2
  },
  "paddleTwo": {
    "yCenter": 50,
    "height": 15,
    "width": 2
  },
  "ball": {
    "x": 63.01,
    "y": 50.00000000000001,
    "semidiameter": 1
  },
  "playerOneScore": 1,
  "playerTwoScore": 4,
  "timestamp": 1740572361614
}
```
```
{
  "status": "live",
  "paddleOne": {
    "yCenter": 50,
    "height": 15,
    "width": 2
  },
  "paddleTwo": {
    "yCenter": 50,
    "height": 15,
    "width": 2
  },
  "ball": {
    "x": 64.50999999999999,
    "y": 50.00000000000001,
    "semidiameter": 1
  },
  "playerOneScore": 1,
  "playerTwoScore": 4,
  "timestamp": 1740572361630
}
```

3) Finished message - one player won
   - sending every 500 ms
```
{
  "status": "finished",
  "paddleOne": {
    "yCenter": 50,
    "height": 15,
    "width": 2
  },
  "paddleTwo": {
    "yCenter": 50,
    "height": 15,
    "width": 2
  },
  "ball": {
    "x": 50,
    "y": 50,
    "semidiameter": 1
  },
  "playerOneScore": 1,
  "playerTwoScore": 10,
  "timestamp": 1740572475113
}
```


### Client
- Client can send only movePaddle message
- if it sends something else, game-service does not care

1) Move paddle message - only 2 possibilities. Direction is negative when moving up and positive when moving down. Server takes just the sing, do not care about the value.
   - move paddle down:
```
{
	"type": "movePaddle",
	"direction": 1
}
```
   - move paddle up:
```
{
	"type": "movePaddle",
	"direction": -1
}
```
