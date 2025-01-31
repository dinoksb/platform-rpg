import { TEXT_SPEED, TILE_SIZE } from "../Config";
import { Direction, DIRECTION } from "../game/common/Direction";
import {
    BATTLE_SCENE_OPTIONS,
    BattleSceneOptions,
} from "../game/common/Options";

interface GlobalState {
    player: {
        position: {
            x: number;
            y: number;
        };
        direction: Direction;
    };
    battleOptions:{
        battleCount: number;
        battleEndCount: number;
    };
    options: {
        battleSceneAnimations: BattleSceneOptions;
        textSpeed: number;
    };
}

const initialState: GlobalState = {
    player: {
        position: {
            x: 6 * TILE_SIZE,
            y: 21 * TILE_SIZE,
        },
        direction: DIRECTION.DOWN,
    },
    battleOptions:{
        battleCount: 0,
        battleEndCount: 2,
    },
    options: {
        battleSceneAnimations: BATTLE_SCENE_OPTIONS.OFF,
        textSpeed: TEXT_SPEED.FAST,
    },
};

export const DATA_MANAGER_STORE_KEYS = {
    PLAYER_POSITION: "PLAYER_POSITION",
    PLAYER_DIRECTION: "PLAYER_DIRECTION",
    BATTLE_OPTIONS_BATTLE_COUNT: "BATTLE_OPTIONS_BATTLE_COUNT",
    BATTLE_OPTIONS_BATTLE_END_COUNT: "BATTLE_OPTIONS_BATTLE_END_COUNT",
    OPTIONS_BATTLE_SCENE_ANIMATIONS: "OPTIONS_BATTLE_SCENE_ANIMATIONS",
    OPTIONS_TEXT_SPEED: "OPTIONS_TEXT_SPEED",
} as const;

class DataManager extends Phaser.Events.EventEmitter {
    private store: Phaser.Data.DataManager;
    constructor() {
        super();
        this.store = new Phaser.Data.DataManager(this);
        this.updateDataManager(initialState);
    }

    public get getStore(): Phaser.Data.DataManager {
        return this.store;
    }

    private updateDataManager(data: GlobalState): void {
        this.store.set({
            [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
            [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
            [DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_COUNT]: data.battleOptions.battleCount,
            [DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_END_COUNT]: data.battleOptions.battleEndCount,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]:
                data.options.battleSceneAnimations,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]:
                data.options.textSpeed,
        });
    }
}

export const dataManager = new DataManager();
