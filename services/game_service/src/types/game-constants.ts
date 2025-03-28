export const GAME_MAX_SCORE = 10;

export const PADDLE_INIT_POSITION = 50;
export const PADDLE_MOVE_STEP = 2.5;
export const PADDLE_WIDTH = 2; // X % of field width
export const PADDLE_HEIGHT = 15;  // X % of field height

export const BALL_SEMIDIAMETER = 1; // this we agreed on
export const BALL_DIAMETER = BALL_SEMIDIAMETER * 2;
export const BALL_INIT_SPEED = 0.8; // 0.5 - 0.9 for start
export const BALL_SPEED_INCREMENT = 1.1; // 10% speed increase per hit
export const BALL_MAX_SPEED = 2; // till 1.5-2 playable
export const BALL_START_X = 50;
export const BALL_START_Y = 50;

export const GAME_TIMEOUT = 3600; // in seconds
export const MAX_BOUNCE_ANGLE_IN_RADS = Math.PI / 2.4; // 75 deg

export const PADDLE_INIT_Y_TOP = PADDLE_INIT_POSITION - PADDLE_HEIGHT / 2 - BALL_SEMIDIAMETER;
export const PADDLE_INIT_Y_BOTTOM = PADDLE_INIT_POSITION + PADDLE_HEIGHT / 2 + BALL_SEMIDIAMETER;