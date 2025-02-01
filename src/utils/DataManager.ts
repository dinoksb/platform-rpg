import { MONSTER_ASSET_KEYS } from "../assets/AssetsKeys";
import { TEXT_SPEED, TILE_SIZE } from "../Config";
import { Direction, DIRECTION } from "../game/common/Direction";
import {
    BATTLE_SCENE_OPTIONS,
    BattleSceneOptions,
} from "../game/common/Options";
import { Monster } from "../game/interfaces/MonsterTypeDef";

interface MonsterData {
    inParty: Monster[];
}

interface GlobalState {
    player: {
        position: {
            x: number;
            y: number;
        };
        direction: Direction;
    };
    battleOptions: {
        battleCount: number;
        battleEndCount: number;
    };
    options: {
        battleSceneAnimations: BattleSceneOptions;
        textSpeed: number;
    };
    monsters: MonsterData;
}

const initialState: GlobalState = {
    player: {
        position: {
            x: 6 * TILE_SIZE,
            y: 21 * TILE_SIZE,
        },
        direction: DIRECTION.DOWN,
    },
    battleOptions: {
        battleCount: 0,
        battleEndCount: 2,
    },
    options: {
        battleSceneAnimations: BATTLE_SCENE_OPTIONS.OFF,
        textSpeed: TEXT_SPEED.FAST,
    },
    monsters: {
        inParty: [
            {
                id: 1,
                monsterId: 1,
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: ["2"],
                baseAttack: 15,
                currentLevel: 5,
            },
        ],
    },
};

export const DATA_MANAGER_STORE_KEYS = {
    PLAYER_POSITION: "PLAYER_POSITION",
    PLAYER_DIRECTION: "PLAYER_DIRECTION",
    BATTLE_OPTIONS_BATTLE_COUNT: "BATTLE_OPTIONS_BATTLE_COUNT",
    BATTLE_OPTIONS_BATTLE_END_COUNT: "BATTLE_OPTIONS_BATTLE_END_COUNT",
    OPTIONS_BATTLE_SCENE_ANIMATIONS: "OPTIONS_BATTLE_SCENE_ANIMATIONS",
    OPTIONS_TEXT_SPEED: "OPTIONS_TEXT_SPEED",
    MONSTERS_IN_PARTY: "MONSTERS_IN_PARTY",
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

    public startGame(): void {
        const existingData = { ...this.dataManagerDataToGlobalStateObject() };
        existingData.player.position = { ...initialState.player.position };
        existingData.player.direction = initialState.player.direction;
        existingData.battleOptions.battleCount =
            initialState.battleOptions.battleCount;
        existingData.battleOptions.battleEndCount =
            initialState.battleOptions.battleEndCount;
        existingData.monsters = {
            inParty: [...initialState.monsters.inParty],
        };

        this.store.reset();
        this.updateDataManager(existingData);
        // this.saveData();
    }

    private updateDataManager(data: GlobalState): void {
        this.store.set({
            [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
            [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
            [DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_COUNT]:
                data.battleOptions.battleCount,
            [DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_END_COUNT]:
                data.battleOptions.battleEndCount,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]:
                data.options.battleSceneAnimations,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]:
                data.options.textSpeed,
            [DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY]: data.monsters.inParty,
        });
    }

    private dataManagerDataToGlobalStateObject(): GlobalState {
        return {
            player: {
                position: {
                    x: this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION)
                        .x,
                    y: this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION)
                        .y,
                },
                direction: this.store.get(
                    DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION
                ),
            },
            options: {
                textSpeed: this.store.get(
                    DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED
                ),
                battleSceneAnimations: this.store.get(
                    DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS
                ),
            },
            battleOptions: {
                battleCount: this.store.get(
                    DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_COUNT
                ),
                battleEndCount: this.store.get(
                    DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_END_COUNT
                ),
            },
            monsters: {
                inParty: [
                    ...this.store.get(
                        DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
                    ),
                ],
            },
        };
    }
}

export const dataManager = new DataManager();
