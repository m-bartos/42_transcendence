export interface CollisionResult {
    time: number;     // Time of collision (0 to 1 within tick)
    normalX1: number; // Normal x for box1
    normalY1: number; // Normal y for box1
    normalX2: number; // Normal x for box2
    normalY2: number; // Normal y for box2
}