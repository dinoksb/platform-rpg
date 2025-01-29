import { CHARACTER_ASSET_KEYS } from "../../../assets/AssetsKeys";
import { exhaustiveGuard } from "../../../utils/Guard";
import { Direction } from "../../common/Direction";
import { Character, CharacterConfig } from "./Character";

interface NPCConfigProps{
    frame: number;
    messages: string[]
}

export type NPCConfig = Omit<
    CharacterConfig,
    "assetKey" | "idleFrameConfig"
> & NPCConfigProps;

export class NPC extends Character {
    private messages: string[];
    private talkingToPlayer: boolean;

    constructor(config: NPCConfig) {
        super({
            ...config,
            assetKey: CHARACTER_ASSET_KEYS.NPC,
            origin: { x: 0, y: 0 },
            idleFrameConfig: {
                DOWN: config.frame,
                UP: config.frame + 1,
                NONE: config.frame,
                LEFT: config.frame + 2,
                RIGHT: config.frame + 2,
            },
        });

        this.messages = config.messages;
        this.talkingToPlayer = false;
        this.phaserGameObject.setScale(4);
    }

    public get getMessages(): string[] {
        return [...this.messages];
    }

    public get isTalkingToPlayer(): boolean{
        return this.talkingToPlayer;
    }

    public set isTalkingToPlayer(val: boolean) {
        this.talkingToPlayer = val;
    }

    public facePlayer(playerDirection: Direction) {
        switch (playerDirection) {
            case "DOWN":
                this.phaserGameObject
                    .setFrame(this.idleFrameConfig.UP)
                    .setFlipX(false);
                break;
            case "LEFT":
                this.phaserGameObject
                    .setFrame(this.idleFrameConfig.RIGHT)
                    .setFlipX(false);
                break;
            case "RIGHT":
                this.phaserGameObject
                    .setFrame(this.idleFrameConfig.LEFT)
                    .setFlipX(true);
                break;
            case "UP":
                this.phaserGameObject
                    .setFrame(this.idleFrameConfig.DOWN)
                    .setFlipX(false);
                break;
            case "NONE":
                break;
            default:
                exhaustiveGuard(playerDirection);
        }
    }
}
