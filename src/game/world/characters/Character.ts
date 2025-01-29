import { getTargetPositionFromGameObjectPositionAndDirection } from "../../../utils/GridUtils";
import { exhaustiveGuard } from "../../../utils/Guard";
import { DIRECTION, Direction } from "../../common/Direction";
import { Coordinate } from "../../interfaces/Coordinate";

export interface CharacterIdleFrameConfig {
    LEFT: number;
    RIGHT: number;
    UP: number;
    DOWN: number;
    NONE: number;
}

export interface CharacterConfig {
    scene: Phaser.Scene;
    assetKey: string;
    origin?: Coordinate;
    position: Coordinate;
    direction: Direction;
    spriteGridMovementFinishedCallback: () => void;
    idleFrameConfig: CharacterIdleFrameConfig;
    collisionLayer: Phaser.Tilemaps.TilemapLayer;
    otherCharactersToCheckForCollisionsWith: Character[] | undefined;
    spriteChangedDirectionCallback: () => void;
}

export class Character {
    protected scene: Phaser.Scene;
    protected phaserGameObject: Phaser.GameObjects.Sprite;
    protected direction: Direction;
    protected isMoving: boolean;
    protected targetPosition: Coordinate;
    protected prevTargetPosition: Coordinate;
    protected spriteGridMovementFinishedCallback: () => void;
    protected idleFrameConfig: CharacterIdleFrameConfig;
    protected origin: Coordinate;
    protected collisionLayer: Phaser.Tilemaps.TilemapLayer;
    protected spriteChangedDirectionCallback: () => void;
    protected otherCharactersToCheckForCollisionsWith: Character[];

    constructor(config: CharacterConfig) {
        if (this.constructor === Character) {
            throw new Error(
                "Character is an abstarct class and cannot be instantiated."
            );
        }

        this.scene = config.scene;
        this.direction = config.direction;
        this.isMoving = false;
        this.targetPosition = { ...config.position };
        this.prevTargetPosition = { ...config.position };
        this.idleFrameConfig = config.idleFrameConfig;
        this.origin = config.origin ? { ...config.origin } : { x: 0, y: 0 };
        this.collisionLayer = config.collisionLayer;
        this.otherCharactersToCheckForCollisionsWith =
            config.otherCharactersToCheckForCollisionsWith || [];
        this.phaserGameObject = this.scene.add
            .sprite(
                config.position.x,
                config.position.y,
                config.assetKey,
                this.getIdleFrame()
            )
            .setOrigin(this.origin.x, this.origin.y);
        this.spriteGridMovementFinishedCallback =
            config.spriteGridMovementFinishedCallback;
        this.spriteChangedDirectionCallback =
            config.spriteChangedDirectionCallback;
    }

    public get getSprite() {
        return this.phaserGameObject;
    }

    public get getIsMoving(): boolean {
        return this.isMoving;
    }

    public get getDirection(): Direction {
        return this.direction;
    }

    public getIdleFrame(): number {
        return this.idleFrameConfig[this.direction];
    }

    public update(): void {
        if (this.isMoving) {
            return;
        }

        const idleFrame =
            this.phaserGameObject.anims.currentAnim?.frames[1].frame.name;
        this.phaserGameObject.anims.stop();
        if (!idleFrame) {
            return;
        }
        switch (this.direction) {
            case "LEFT":
            case "RIGHT":
            case "UP":
            case "DOWN":
                this.phaserGameObject.setFrame(idleFrame);
                break;
            case DIRECTION.NONE:
                break;
            default:
                exhaustiveGuard(this.direction);
        }
    }

    public moveCharacter(direction: Direction): void {
        if (this.isMoving) {
            return;
        }
        this.moveSprite(direction);
    }

    public addCharacterToCheckForCollisionsWith(character: Character): void {
        this.otherCharactersToCheckForCollisionsWith.push(character);
    }

    public moveSprite(direction: Direction): void {
        const changedDirection = this.direction !== direction;
        this.direction = direction;

        if (changedDirection) {
            if (this.spriteChangedDirectionCallback !== undefined) {
                this.spriteChangedDirectionCallback();
            }
        }

        if (this.isBlockingTile()) {
            return;
        }

        this.isMoving = true;
        this.handleSpriteMovement();
    }

    private isBlockingTile(): boolean {
        if (this.direction === DIRECTION.NONE) {
            return false;
        }

        const targetPosition = { ...this.targetPosition };
        const updatedPosition =
            getTargetPositionFromGameObjectPositionAndDirection(
                targetPosition,
                this.direction
            );

        return (
            this.doesPositionCollideWithCollisionLayer(updatedPosition) ||
            this.doesPositionCollideWithOtherCharacter(updatedPosition)
        );
    }

    private handleSpriteMovement(): void {
        if (this.direction === DIRECTION.NONE) {
            return;
        }

        const updatedPosition =
            getTargetPositionFromGameObjectPositionAndDirection(
                this.targetPosition,
                this.direction
            );
        this.prevTargetPosition = { ...this.targetPosition };
        this.targetPosition.x = updatedPosition.x;
        this.targetPosition.y = updatedPosition.y;

        this.scene.add.tween({
            delay: 0,
            duration: 500,
            y: {
                from: this.phaserGameObject.y,
                start: this.phaserGameObject.y,
                to: this.targetPosition.y,
            },
            x: {
                from: this.phaserGameObject.x,
                start: this.phaserGameObject.x,
                to: this.targetPosition.x,
            },
            targets: this.phaserGameObject,
            onComplete: () => {
                this.isMoving = false;
                this.prevTargetPosition = { ...this.targetPosition };
                if (this.spriteGridMovementFinishedCallback) {
                    this.spriteGridMovementFinishedCallback();
                }
            },
        });
    }

    private doesPositionCollideWithCollisionLayer(
        position: Coordinate
    ): boolean {
        if (!this.collisionLayer) {
            return false;
        }

        const { x, y } = position;
        const tile = this.collisionLayer.getTileAtWorldXY(x, y, true);

        return tile.index !== -1;
    }

    private doesPositionCollideWithOtherCharacter(
        position: Coordinate
    ): boolean {
        const { x, y } = position;
        if (this.otherCharactersToCheckForCollisionsWith.length === 0) {
            return false;
        }

        const collidesWithACharacter =
            this.otherCharactersToCheckForCollisionsWith.some((character) => {
                return (
                    (character.targetPosition.x === x &&
                        character.targetPosition.y === y) ||
                    (character.prevTargetPosition.x === x &&
                        character.prevTargetPosition.y === y)
                );
            });
        return collidesWithACharacter;
    }
}
