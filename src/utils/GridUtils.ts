import { TILE_SIZE } from "../Config";
import { Direction } from "../game/common/Direction";
import { Coordinate } from "../game/interfaces/Coordinate";
import { exhaustiveGuard } from "./Guard";

export function getTargetPositionFromGameObjectPositionAndDirection(
    currentPosition: Coordinate,
    direction: Direction
): Coordinate {
    const targetPosition = { ...currentPosition };
    switch (direction) {
        case "LEFT":
            targetPosition.x -= TILE_SIZE;
            break;
        case "RIGHT":
            targetPosition.x += TILE_SIZE;
            break;
        case "UP":
            targetPosition.y -= TILE_SIZE;
            break;
        case "DOWN":
            targetPosition.y += TILE_SIZE;
            break;
        default:
            exhaustiveGuard(direction);
    }

    return targetPosition;
}
