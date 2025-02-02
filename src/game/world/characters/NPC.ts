import { CHARACTER_ASSET_KEYS } from "../../../assets/AssetKeys";
import { exhaustiveGuard } from "../../../utils/Guard";
import { Direction } from "../../common/Direction";
import { NpcEvent } from "../../interfaces/TypeDef";
import { Character, CharacterConfig } from "./Character";

interface NPCConfigProps{
    frame: number;
    events: NpcEvent[]
}

export type NPCConfig = Omit<
    CharacterConfig,
    "assetKey" | "idleFrameConfig"
> & NPCConfigProps;

export class NPC extends Character {
    private talkingToPlayer: boolean;
    private events: NpcEvent[];

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

        this.talkingToPlayer = false;
        this.phaserGameObject.setScale(4);
        this.events = config.events;
    }

    public get getEvents(): NpcEvent[] {
        return [...this.events];
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
