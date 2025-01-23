import { CHARACTER_ASSET_KEYS } from "../../../assets/AssetsKeys";
import { exhaustiveGuard } from "../../../utils/Guard";
import { DIRECTION, Direction } from "../../common/Direction";
import { Character, CharacterConfig } from "./Character";

export type PlayerConfig = Omit<
    CharacterConfig,
    "assetKey" | "idleFrameConfig"
>;

export class Player extends Character {
    constructor(config: PlayerConfig) {
        super({
            ...config,
            assetKey: CHARACTER_ASSET_KEYS.PLAYER,
            origin: { x: 0, y: 0.2 },
            idleFrameConfig: {
                DOWN: 7,
                UP: 1,
                NONE: 7,
                LEFT: 10,
                RIGHT: 4,
            },
        });
    }

    public override moveCharacter(direction: Direction) {
        super.moveCharacter(direction);

        switch (direction) {
            case "LEFT":
            case "RIGHT":
            case "UP":
            case "DOWN":
                if (
                    !this.phaserGameObject.anims.isPlaying ||
                    this.phaserGameObject.anims.currentAnim?.key !==
                        `PLAYER_${this.direction}`
                ) {
                    this.phaserGameObject.play(`PLAYER_${this.direction}`);
                }
                break;
            case DIRECTION.NONE:
                break;
            default:
                exhaustiveGuard(direction);
        }
    }
}
