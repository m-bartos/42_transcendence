# Game Service
This service provides
- Create games internally via API when needed by the matchmaking service
- Play games via websockets (game logic)

## Endpoints
See routes folder for detailed route definitions and request/response schemas
1) /api/games - POST - create game


## Matchmaking and game logic
![Transcendence](https://github.com/user-attachments/assets/6afb2fd6-fddf-429b-a810-dfcb9883f119)

## Websocket communication:

### Server

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

1) Move paddle message - only 2 possibilities
- move paddle down:
```
{
	movePaddle: 1
}
```
- move paddle up:
```
{
	movePaddle: -1
}
```