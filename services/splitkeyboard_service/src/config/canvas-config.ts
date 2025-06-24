import {CANVAS_HEIGHT, CANVAS_WIDTH} from "./game-config.js";

export interface CanvasConfig {
    width: number;
    height: number;
}

export const CANVAS_CONFIG: CanvasConfig = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
}