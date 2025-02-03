import { SCENE_KEYS } from "./SceneKeys";
import { WORLD_ASSET_KEYS } from "../../assets/AssetKeys";
import { Player } from "../world/characters/Player";
import { DIRECTION } from "../common/Direction";
import {
    TILE_SIZE,
    TILED_COLLISION_LAYER_ALPHA,
} from "../../Config";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { DialogUI } from "../world/DialogUI";
import { NPC } from "../world/characters/NPC";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../../utils/GridUtils";
import { ToggleableCollisionLayer } from "../world/characters/Character";
import { Menu } from "../battle/ui/menu/Menu";
import { BaseScene } from "./BaseScene";
import { InventorySceneData } from "./InventoryScene";
import { MonsterPartySceneData } from "./MonsterPartyScene";
import { BattleSceneData } from "./BattleScene";
import { DataUtils } from "../../utils/DataUtils";
import { Monster, NPC_EVENT_TYPE } from "../interfaces/TypeDef";
import { weightedRandom } from "../../utils/Random";
import { exhaustiveGuard } from "../../utils/Guard";
import { EncounterManager } from "../world/encounter/EncounterManager";
import { RandomEncounterStrategy } from "../world/encounter/RandomEncounterStrategy";

interface TiledObjectProperty {
    name: string;
    type: string;
    value: any;
}

const CUSTOM_TILED_TYPE = {
    NPC: "npc",
} as const;

const TILED_NPC_PROPERTY = {
    FRAME: "frame",
    ID: "id",
} as const;

const TILED_ENCOUNTER_PROPERTY = {
    AREA: "area",
} as const;

export interface WorldSceneData {
    isPlayerKnockedOut: boolean;
}

export class WorldScene extends BaseScene {
    private player: Player;
    private encounterLayer: Phaser.Tilemaps.TilemapLayer;
    private toggleableLayers: ToggleableCollisionLayer[];
    private wildMonsterEncountered: boolean;
    private dialogUI: DialogUI;
    private isNewGame: boolean;
    private npcs: NPC[];
    private npcPlayerIsInteractingWith: NPC | undefined;
    private menu: Menu;
    private sceneData: WorldSceneData;
    private lastNpcEventHandledIndex: number;
    private isProcessingNpcEvent: boolean;
    private moreNpcEventsToProcess: boolean;
    private encounterManager: EncounterManager;

    constructor() {
        super({
            key: SCENE_KEYS.WORLD_SCENE,
        });
        this.isNewGame = false;
    }

    init(data: WorldSceneData) {
        super.init(data);
        this.sceneData = data;

        if (Object.keys(data).length === 0) {
            this.sceneData = {
                isPlayerKnockedOut: false,
            };
        }

        this.wildMonsterEncountered = false;
        this.npcPlayerIsInteractingWith = undefined;
        this.isNewGame = !dataManager.getStore.get(
            DATA_MANAGER_STORE_KEYS.GAME_STARTED
        );

        // update player location, and map data if the player knocked out in a battle
        if (this.sceneData.isPlayerKnockedOut) {
            let map = this.make.tilemap({
                key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,
            });
            const reviveLocation =
                map.getObjectLayer("Revive-Location")?.objects[0];

            dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
                x: reviveLocation?.x ? reviveLocation.x * TILE_SIZE : 0,
                y: reviveLocation?.y ? reviveLocation.y * TILE_SIZE : 0,
            });
            dataManager.getStore.set(
                DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
                DIRECTION.DOWN
            );
        }
        this.lastNpcEventHandledIndex = -1;
        this.isProcessingNpcEvent = false;
        this.moreNpcEventsToProcess = false;
    }

    create() {
        super.create();

        const x = 6 * TILE_SIZE;
        const y = 22 * TILE_SIZE;
        this.cameras.main.setBounds(0, 0, 1280, 2176);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.centerOn(x, y);

        const map = this.make.tilemap({
            key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,
        });

        // map collision
        const collisionTiles = map.addTilesetImage(
            "collision",
            WORLD_ASSET_KEYS.WORLD_COLLISION
        );
        if (!collisionTiles) {
            console.log(
                `[${WorldScene.name}:create] encountered error while creating collision tileset using data from tiled`
            );
            return;
        }

        const collisionLayer = map.createLayer(
            "Collision",
            collisionTiles,
            0,
            0
        );
        if (!collisionLayer) {
            console.log(
                `[${WorldScene.name}:create] encountered error while creating collision layer using data from tiled`
            );
            return;
        }
        collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);

        const boulderCollisionTiles = map.addTilesetImage(
            "boulder",
            WORLD_ASSET_KEYS.WORLD_BOULDER_COLLISION
        );
        if (!boulderCollisionTiles) {
            console.log(
                `[${WorldScene.name}:create] encountered error while creating boulder collision tileset using data from tiled`
            );
            return;
        }
        const boulderCollisionLayer = map.createLayer(
            "Boulder",
            boulderCollisionTiles,
            0,
            0
        );
        if (!boulderCollisionLayer) {
            console.log(
                `[${WorldScene.name}:create] encountered error while creating boulder collision layer using data from tiled`
            );
            return;
        }
        boulderCollisionLayer.setAlpha(1).setDepth(2);
        const toggleableLayers: ToggleableCollisionLayer[] = [
            {
                layer: boulderCollisionLayer,
                name: WORLD_ASSET_KEYS.WORLD_BOULDER_COLLISION,
                isCollisionEnabled: true,
            },
        ];
        this.toggleableLayers = toggleableLayers;

        // map encounter zone
        const encounterTiles = map.addTilesetImage(
            "encounter",
            WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE
        );
        if (!encounterTiles) {
            console.log(
                `[${WorldScene.name}:create] encountered error while creating encounter tileset using data from tiled`
            );
            return;
        }
        const encounterLayer = map.createLayer(
            "Encounter",
            encounterTiles,
            0,
            0
        );
        if (!encounterLayer) {
            console.log(
                `[${WorldScene.name}:create] encountered error while creating encounter layer using data from tiled`
            );
            return;
        }
        this.encounterLayer = encounterLayer;
        encounterLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);

        this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

        // create npcs
        this.createNPCs(map);

        this.player = new Player({
            scene: this,
            position: dataManager.getStore.get(
                DATA_MANAGER_STORE_KEYS.PLAYER_POSITION
            ),
            direction: dataManager.getStore.get(
                DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION
            ),
            collisionLayer: collisionLayer,
            toggleableLayers: this.toggleableLayers,
            spriteGridMovementFinishedCallback: () => {
                this.handlePlayerMovementUpdate();
            },
            spriteChangedDirectionCallback: () => {
                this.handlePlayerDirectionUpdate();
            },
            otherCharactersToCheckForCollisionsWith: this.npcs,
        });
        this.cameras.main.startFollow(this.player.getSprite);

        // update our collisions with npcs
        this.npcs.forEach((npc) => {
            npc.addCharacterToCheckForCollisionsWith(this.player);
        });

        // create foreground for depth
        this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

        // create dialog ui
        this.dialogUI = new DialogUI(this, 1280);

        // create menu
        this.menu = new Menu(this);

        // load data from dataManager
        const battleCount = dataManager.getStore.get(
            DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_COUNT
        );
        const battleEndCount = dataManager.getStore.get(
            DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_END_COUNT
        );

        if (battleCount >= battleEndCount) {
            this.setCollisionEnabledForLayer(
                WORLD_ASSET_KEYS.WORLD_BOULDER_COLLISION,
                false
            );
        } else {
            this.setCollisionEnabledForLayer(
                WORLD_ASSET_KEYS.WORLD_BOULDER_COLLISION,
                true
            );
        }

        // creat encounterManager
        this.encounterManager = new EncounterManager(new RandomEncounterStrategy());

        this.cameras.main.fadeIn(
            1000,
            0,
            0,
            0,
            (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    // if the player was knocked out, want lock input, heal player, and have show message
                    if (this.sceneData.isPlayerKnockedOut) {
                        this.healPlayerParty();
                        this.dialogUI.showDialogModal([
                            "I fought pretty well, but I lost in the end...",
                            "This time, I’ll make sure to succeed in my adventure!",
                        ]);
                    }
                }
            }
        );
        
        if (this.isNewGame) {
            this.controls.lockInput = true;
            this.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
                () => {
                    this.dialogUI.showDialogModal([
                        "Start an exciting journey with your monster!",
                    ]);
                    this.controls.lockInput = false;

                    const monstersInParty: Monster[] = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY);
                    const clonedMonster = DataUtils.getMonsterById(this, 1);
                    const startingMonster = {...clonedMonster};
                    monstersInParty.push(startingMonster);
                    dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, monstersInParty);
                }
            );
        }

        dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.GAME_STARTED, true);
    }

    update() {
        super.update();

        if (this.wildMonsterEncountered) {
            this.player.update();
            return;
        }

        const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
        const selectedDirectionHelDown =
            this.controls.getDirectionKeyPressDown();
        const selectedDirectionPressedOnce =
            this.controls.getDirectionKeyJustPressed();
        if (
            selectedDirectionHelDown !== DIRECTION.NONE &&
            !this.isPlayerInputLocked()
        ) {
            this.player.moveCharacter(selectedDirectionHelDown);
        }

        if (
            wasSpaceKeyPressed &&
            !this.player.getIsMoving &&
            !this.menu.getIsVisible
        ) {
            this.handlePlayerInteraction();
        }

        if (this.controls.wasEnterKeyPressed() && !this.player.getIsMoving) {
            if (this.dialogUI.getIsVisible || this.isProcessingNpcEvent) {
                return;
            }

            if (this.menu.getIsVisible) {
                this.menu.hide();
                return;
            }

            this.menu.show();
        }

        if (this.menu.getIsVisible) {
            if (selectedDirectionPressedOnce !== DIRECTION.NONE) {
                this.menu.handlePlayerInput(selectedDirectionPressedOnce);
            }

            if (wasSpaceKeyPressed) {
                this.menu.handlePlayerInput("OK");

                if (this.menu.getSelectedMenuOption === "SAVE") {
                    this.menu.hide();
                    dataManager.saveData();
                    this.dialogUI.showDialogModal([
                        "Game progress has been saved",
                    ]);
                }

                if (this.menu.getSelectedMenuOption === "MONSTERS") {
                    const sceneDataToPass: MonsterPartySceneData = {
                        previousSceneName: SCENE_KEYS.WORLD_SCENE,
                    };
                    this.scene.launch(
                        SCENE_KEYS.MONSTER_PARTY_SCENE,
                        sceneDataToPass
                    );
                    this.scene.pause();
                }

                if (this.menu.getSelectedMenuOption === "BAG") {
                    const sceneDataToPass: InventorySceneData = {
                        previousSceneName: SCENE_KEYS.WORLD_SCENE,
                    };
                    this.scene.launch(
                        SCENE_KEYS.INVENTORY_SCENE,
                        sceneDataToPass
                    );
                    this.scene.pause();
                }

                if (this.menu.getSelectedMenuOption === "EXIT") {
                    this.menu.hide();
                }
            }

            if (this.controls.wasBackKeyPressed()) {
                this.menu.hide();
            }
        }

        this.player.update();

        this.npcs.forEach((npc) => {
            npc.update();
        });
    }

    private handlePlayerMovementUpdate() {
        dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
            x: this.player.getSprite.x,
            y: this.player.getSprite.y,
        });

        dataManager.getStore.set(
            DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
            this.player.getDirection
        );

        this.handleWildMonsterBattleEncounter();
    }

    private handlePlayerInteraction() {
        if (this.dialogUI.getIsAnimationPlaying) {
            return;
        }

        if (
            this.dialogUI.getIsVisible &&
            !this.dialogUI.getMoreMessagesToShow
        ) {
            this.dialogUI.hideDialogModal();
            if (this.npcPlayerIsInteractingWith) {
                this.npcPlayerIsInteractingWith.isTalkingToPlayer = false;

                if (!this.moreNpcEventsToProcess)
                    this.npcPlayerIsInteractingWith = undefined;
            }
            return;
        }

        if (this.dialogUI.getIsVisible && this.dialogUI.getMoreMessagesToShow) {
            this.dialogUI.showNextMessage();
            return;
        }

        const { x, y } = this.player.getSprite;
        const targetPosition =
            getTargetPositionFromGameObjectPositionAndDirection(
                { x, y },
                this.player.getDirection
            );

        const nearbyNpc = this.npcs.find((npc) => {
            return (
                npc.getSprite.x === targetPosition.x &&
                npc.getSprite.y === targetPosition.y
            );
        });
        if (nearbyNpc) {
            nearbyNpc.facePlayer(this.player.getDirection);
            nearbyNpc.isTalkingToPlayer = true;
            this.npcPlayerIsInteractingWith = nearbyNpc;
            this.handleNpcInteraction();
            return;
        }
    }

    private isPlayerInputLocked() {
        return (
            this.controls.isInputLocked ||
            this.dialogUI.getIsVisible ||
            this.menu.getIsVisible ||
            this.isProcessingNpcEvent
        );
    }

    private handlePlayerDirectionUpdate() {
        dataManager.getStore.set(
            DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
            this.player.getDirection
        );
    }

    private createNPCs(map: Phaser.Tilemaps.Tilemap) {
        this.npcs = [];

        const npcLayers = map
            .getObjectLayerNames()
            .filter((layerName) => layerName.includes("NPC"));
        npcLayers.forEach((layerName) => {
            const layer = map.getObjectLayer(layerName);
            const npcObject = layer?.objects.find((obj) => {
                return obj.type === CUSTOM_TILED_TYPE.NPC;
            });

            if (
                !npcObject ||
                npcObject.x === undefined ||
                npcObject.y === undefined
            ) {
                return;
            }

            const npcId =
                npcObject.properties.find(
                    (property: TiledObjectProperty) =>
                        property.name === TILED_NPC_PROPERTY.ID
                )?.value || "0";
            const npcDetails = DataUtils.getNpcData(this, npcId);
            const npc = new NPC({
                scene: this,
                position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
                direction: DIRECTION.DOWN,
                collisionLayer: undefined,
                otherCharactersToCheckForCollisionsWith: [], // 또는 NPC끼리의 충돌을 검사할 대상 배열 (없다면 빈 배열)
                frame: npcDetails.frame,
                spriteGridMovementFinishedCallback: () => {},
                spriteChangedDirectionCallback: () => {},
                events: npcDetails.events,
            });

            this.npcs.push(npc);
        });
    }

    private handleWildMonsterBattleEncounter() {
        if (!this.encounterLayer) {
            return;
        }

        const { x, y } = this.player.getSprite;

        this.wildMonsterEncountered = this.encounterManager.checkEncounter({x, y}, this.encounterLayer);
        if(!this.wildMonsterEncountered){
            return;
        }
        const encounterAreaId = (
            this.encounterLayer.layer.properties as TiledObjectProperty[]
        ).find(
            (property) => property.name === TILED_ENCOUNTER_PROPERTY.AREA
        )?.value;
        const possibleMonsters = DataUtils.getEncounterAreaDetails(
            this,
            encounterAreaId
        );
        const randomMonsterId = weightedRandom(possibleMonsters);

        console.log(
            `[${WorldScene.name}:handlePlayerMovementUpdate] player is encountered a wild monster in area ${encounterAreaId} and monster id has been picked randomly ${randomMonsterId}`
        );
        this.cameras.main.fadeOut(1000, 0, 0);
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
                const dataToPass: BattleSceneData = {
                    enemyMonsters: [
                        DataUtils.getMonsterById(this, randomMonsterId),
                    ],
                    playerMonsters: dataManager.getStore.get(
                        DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
                    ),
                };
                this.scene.start(SCENE_KEYS.BATTLE_SCENE, dataToPass);
            }
        );
        // this.whildMonsterEncountered = Math.random() < BATTLE_ENCOUNTER_RATE;
        // if (this.whildMonsterEncountered) {
        //     const encounterAreaId = (
        //         this.encounterLayer.layer.properties as TiledObjectProperty[]
        //     ).find(
        //         (property) => property.name === TILED_ENCOUNTER_PROPERTY.AREA
        //     )?.value;
        //     const possibleMonsters = DataUtils.getEncounterAreaDetails(
        //         this,
        //         encounterAreaId
        //     );
        //     const randomMonsterId = weightedRandom(possibleMonsters);

        //     console.log(
        //         `[${WorldScene.name}:handlePlayerMovementUpdate] player is encountered a wild monster in area ${encounterAreaId} and monster id has been picked randomly ${randomMonsterId}`
        //     );
        //     this.cameras.main.fadeOut(1000, 0, 0);
        //     this.cameras.main.once(
        //         Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        //         () => {
        //             const dataToPass: BattleSceneData = {
        //                 enemyMonsters: [
        //                     DataUtils.getMonsterById(this, randomMonsterId),
        //                 ],
        //                 playerMonsters: dataManager.getStore.get(
        //                     DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
        //                 ),
        //             };
        //             this.scene.start(SCENE_KEYS.BATTLE_SCENE, dataToPass);
        //         }
        //     );
        // }
    }

    private setCollisionEnabledForLayer(layerName: string, enable: boolean) {
        const found = this.toggleableLayers.find(
            (layerInfo) => layerInfo.name === layerName
        );
        if (!found) {
            console.warn(`No layer found with name: ${layerName}`);
            return;
        }

        if (enable) {
            found.layer.setAlpha(1);
        } else {
            found.layer.setAlpha(0);
        }
        found.isCollisionEnabled = enable;
    }

    private healPlayerParty(): void {
        const monsters = dataManager.getStore.get(
            DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
        );
        monsters.forEach((monster: Monster) => {
            monster.currentHp = monster.maxHp;
        });
        dataManager.getStore.set(
            DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY,
            monsters
        );
    }

    private handleNpcInteraction() {
        if (
            this.isProcessingNpcEvent ||
            this.npcPlayerIsInteractingWith === undefined
        ) {
            return;
        }

        const isMoreEventsToProcess: boolean =
            this.npcPlayerIsInteractingWith.getEvents.length - 1 !==
            this.lastNpcEventHandledIndex;

        if (!isMoreEventsToProcess) {
            if (this.npcPlayerIsInteractingWith) {
                this.npcPlayerIsInteractingWith.isTalkingToPlayer = false;
            }
            this.npcPlayerIsInteractingWith = undefined;
            this.lastNpcEventHandledIndex = -1;
            this.isProcessingNpcEvent = false;
            this.moreNpcEventsToProcess = false;
            return;
        } else {
            this.moreNpcEventsToProcess = true;
        }

        this.lastNpcEventHandledIndex += 1;
        const eventToHandle =
            this.npcPlayerIsInteractingWith?.getEvents[
                this.lastNpcEventHandledIndex
            ];

        if (!eventToHandle) {
            console.error("No event to handle");
            return;
        }

        const eventType = eventToHandle?.type;
        switch (eventType) {
            case NPC_EVENT_TYPE.MESSAGE:
                const messages = eventToHandle?.data.messages;
                if (messages == undefined) {
                    console.error("messages is undefined");
                    return;
                }
                this.dialogUI.showDialogModal(messages);

                if (isMoreEventsToProcess) {
                    this.waitForDialogToCloseWithPhaser(() => {
                        this.handleNpcInteraction();
                    });
                }

                break;
            case NPC_EVENT_TYPE.SCENE_FADE_IN_AND_OUT:
                this.isProcessingNpcEvent = true;
                // lock input, and wait for scene to fade in and out
                this.cameras.main.fadeOut(
                    eventToHandle.data.fadeOutDuration,
                    0,
                    0,
                    0,
                    (fadeOutCamera, fadeOutProgress: number) => {
                        if (fadeOutProgress !== 1) {
                            return;
                        }
                        this.time.delayedCall(
                            eventToHandle.data.waitDuration,
                            () => {
                                this.cameras.main.fadeIn(
                                    eventToHandle.data.fadeInDuration,
                                    0,
                                    0,
                                    0,
                                    (fadeInCamera, fadeInProgress: number) => {
                                        if (fadeInProgress !== 1) {
                                            return;
                                        }
                                        this.isProcessingNpcEvent = false;
                                        this.handleNpcInteraction();
                                    }
                                );
                            }
                        );
                    }
                );
                break;
            case NPC_EVENT_TYPE.SCENE_CHANGE:
                this.isProcessingNpcEvent = true;
                this.cameras.main.once(
                    Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                    () => {
                        this.scene.start(eventToHandle.data.sceneName);
                    }
                );
                // lock input, and wait for scene to fade in and out
                this.cameras.main.fadeOut(
                    eventToHandle.data.fadeOutDuration,
                    0,
                    0,
                    0
                );
                break;
            default:
                exhaustiveGuard(eventType);
        }
    }

    private waitForDialogToCloseWithPhaser(callback: () => void) {
        this.time.delayedCall(100, () => {
            if (!this.dialogUI.getIsVisible) {
                callback();
            } else {
                this.waitForDialogToCloseWithPhaser(callback); // 🔄 다시 검사
            }
        });
    }
}
