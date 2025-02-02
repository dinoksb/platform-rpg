import { TEXT_SPEED, TILE_SIZE } from "../Config";
import { Direction, DIRECTION } from "../game/common/Direction";
import {
    BATTLE_SCENE_OPTIONS,
    BattleSceneOptions,
} from "../game/common/Options";
import {
    BaseInventoryItem,
    Inventory,
    InventoryItem,
    Monster,
} from "../game/interfaces/TypeDef";
import { DataUtils } from "./DataUtils";

const LOCAL_STORAGE_KEY = "MONSTER_TAMER_DATA";

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
    gameStarted: boolean;
    monsters: MonsterData;
    inventory: Inventory;
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
    gameStarted: false,
    monsters: {
        inParty: [],
    },
    inventory: [
        {
            item: {
                id: 1,
            },
            quantity: 1,
        },
    ],
};

export const DATA_MANAGER_STORE_KEYS = {
    PLAYER_POSITION: "PLAYER_POSITION",
    PLAYER_DIRECTION: "PLAYER_DIRECTION",
    BATTLE_OPTIONS_BATTLE_COUNT: "BATTLE_OPTIONS_BATTLE_COUNT",
    BATTLE_OPTIONS_BATTLE_END_COUNT: "BATTLE_OPTIONS_BATTLE_END_COUNT",
    OPTIONS_BATTLE_SCENE_ANIMATIONS: "OPTIONS_BATTLE_SCENE_ANIMATIONS",
    OPTIONS_TEXT_SPEED: "OPTIONS_TEXT_SPEED",
    GAME_STARTED: "GAME_STARTED",
    MONSTERS_IN_PARTY: "MONSTERS_IN_PARTY",
    INVENTORY: "INVENTORY",
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

    init(scene: Phaser.Scene): void {
        const startingMonster = DataUtils.getMonsterById(scene, 1);
        this.store.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, [
            startingMonster,
        ]);
    }

    public saveData() {
        if (typeof Storage === "undefined") {
            console.warn(
                `[${DataManager.name}:saveData] localStorage is not supported, will not be able to save and load data.`
            );
            return;
        }
        const dataToSave = this.dataManagerDataToGlobalStateObject();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }

    public loadData() {
        if (typeof Storage === "undefined") {
            console.warn(
                `[${DataManager.name}:loadData] localStorage is not supported, will not be able to save and load data.`
            );
            return;
        }

        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData === null) {
            return;
        }
        try {
            // TODO: should add error handling and data validation at this step to make sure we get the data we expect.
            const parsedData = JSON.parse(savedData);
            // update the state with the saved data
            this.updateDataManager(parsedData);
        } catch (error) {
            console.warn(
                `[${DataManager.name}:loadData] encountered an error while attempting to load and parse saved data.`
            );
        }
    }

    public startNewGame(scene: Phaser.Scene): void {
        const existingData = { ...this.dataManagerDataToGlobalStateObject() };
        existingData.player.position = { ...initialState.player.position };
        existingData.player.direction = initialState.player.direction;
        existingData.gameStarted = initialState.gameStarted;
        existingData.battleOptions.battleCount =
            initialState.battleOptions.battleCount;
        existingData.battleOptions.battleEndCount =
            initialState.battleOptions.battleEndCount;
        existingData.monsters = {
            inParty: [...initialState.monsters.inParty],
        };
        existingData.inventory = initialState.inventory;

        this.store.reset();
        this.updateDataManager(existingData);
        this.init(scene);
        this.saveData();
    }

    public getInventory(scene: Phaser.Scene): InventoryItem[] {
        const items: InventoryItem[] = [];
        const inventory: Inventory = this.store.get(
            DATA_MANAGER_STORE_KEYS.INVENTORY
        );
        inventory.forEach((baseItem: BaseInventoryItem) => {
            const item = DataUtils.getItem(scene, baseItem.item.id);
            items.push({
                item: item,
                quantity: baseItem.quantity,
            });
        });
        return items;
    }

    updateInventory(items: InventoryItem[]): void {
        const inventory: BaseInventoryItem[] = items.map(
            (item: InventoryItem) => {
                return {
                    item: {
                        id: item.item.id,
                    },
                    quantity: item.quantity,
                };
            }
        );

        this.store.set(DATA_MANAGER_STORE_KEYS.INVENTORY, inventory);
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
            [DATA_MANAGER_STORE_KEYS.GAME_STARTED]: data.gameStarted,
            [DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY]: data.monsters.inParty,
            [DATA_MANAGER_STORE_KEYS.INVENTORY]: data.inventory,
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
            gameStarted: this.store.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED),
            monsters: {
                inParty: [
                    ...this.store.get(
                        DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
                    ),
                ],
            },
            inventory: this.store.get(DATA_MANAGER_STORE_KEYS.INVENTORY),
        };
    }
}

export const dataManager = new DataManager();
