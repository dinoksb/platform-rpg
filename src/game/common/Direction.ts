export const DIRECTION = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
    NONE: 'NONE',
} as const;

export type Direction = typeof DIRECTION[keyof typeof DIRECTION];