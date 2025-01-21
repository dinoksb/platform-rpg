export const DIRECTION = {
    NONE: "NONE",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    UP: "UP",
    DOWN: "DOWN",
} as const;

export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];
