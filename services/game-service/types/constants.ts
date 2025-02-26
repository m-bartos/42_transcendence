export const GAME_MAX_SCORE = 10;

export const PADDLE_INIT_POSITION = 50;
export const PADDLE_MOVE_STEP = 2.5;
export const PADDLE_WIDTH = 40; // 2% of field width
export const PADDLE_HEIGHT = 15;  // 15% of field height

export const BALL_SEMIDIAMETER = 1; // this we agreed on
export const BALL_DIAMETER = BALL_SEMIDIAMETER * 2;
export const BALL_INIT_SPEED = 0.1; // 0.5 - 0.9 for start
export const BALL_SPEED_INCREMENT = 1.1; // 10% speed increase per hit
export const BALL_MAX_SPEED = 1.5; // till 1.5 playable

export const MAX_BOUNCE_ANGLE_IN_RADS = Math.PI / 2.4; // 75 deg

export const PADDLE_INIT_Y_TOP = PADDLE_INIT_POSITION - PADDLE_HEIGHT / 2 - BALL_SEMIDIAMETER;
export const PADDLE_INIT_Y_BOTTOM = PADDLE_INIT_POSITION + PADDLE_HEIGHT / 2 + BALL_SEMIDIAMETER;