export interface BoxGeometry {
    x: number;      // Center x-coordinate
    y: number;      // Center y-coordinate
    width: number;  // Full width of the box
    height: number; // Full height of the box
    vx: number;     // Velocity in x-direction
    vy: number;     // Velocity in y-direction
}

export enum BoxType {
    Paddle = 1,
    Ball = 2,
    HorizontalBorder = 3,
    VerticalBorder = 4,
}