import { Scene } from "phaser";
import { SCENE_KEYS } from "./SceneKeys";
import { WORLD_ASSET_KEYS } from "../../assets/AssetsKeys";
import { Player } from "../world/characters/Player";
import { Controls } from "../../utils/Controls";
import { DIRECTION } from "../common/Direction";
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from "../../Config";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { DialogUI } from "../world/DialogUI";
import { NPC } from "../world/characters/NPC";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../../utils/GridUtils";

interface TiledObjectProperty {
    name: string;
    type: string;
    value: any;
}

const CUSTOM_TILED_TYPE = {
    NPC: "npc",
} as const;

const TILED_NPC_PROPERTY = {
    IS_SPAWN_POINT: "is_spawn_point",
    MESSAGES: "messages",
    FRAME: "frame",
} as const;

export class WorldScene extends Scene {
    private player: Player;
    private controls: Controls;
    private encounterLayer: Phaser.Tilemaps.TilemapLayer;
    private whildMonsterEncountered: boolean;
    private dialogUI: DialogUI;
    private isShowStartMessage: boolean;
    private npcs: NPC[];
    private npcPlayerIsInteractingWith: NPC | undefined;

    constructor() {
        super({
            key: SCENE_KEYS.WORLD_SCENE,
        });
        this.isShowStartMessage = false;
    }

    init() {
        this.whildMonsterEncountered = false;
        this.npcPlayerIsInteractingWith = undefined;
    }

    create() {
        console.log(`[${WorldScene.name}:create] invoked`);

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

        this.controls = new Controls(this);
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        if (!this.isShowStartMessage) {
            this.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
                () => {
                    this.dialogUI.showDialogModal([
                        "Start an exciting journey with your monster!",
                    ]);
                    this.isShowStartMessage = true;
                }
            );
        }
    }

    update() {
        if (this.whildMonsterEncountered) {
            this.player.update();
            return;
        }

        const selectedDirection = this.controls.getDirectionKeyPressDown();
        if (
            selectedDirection !== DIRECTION.NONE &&
            !this.isPlayerInputLocked() &&
            this.isShowStartMessage
        ) {
            this.player.moveCharacter(selectedDirection);
        }

        if (this.controls.wasSpaceKeyPressed() && !this.player.getIsMoving) {
            this.handlePlayerInteraction();
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

        if (!this.encounterLayer) {
            return;
        }

        const { x, y } = this.player.getSprite;
        const isInEncounterZone =
            this.encounterLayer.getTileAtWorldXY(x, y, true).index !== -1;
        if (!isInEncounterZone) {
            return;
        }

        console.log(
            `[${WorldScene.name}:handlePlayerMovementUpdate] player is in an encounter zone`
        );
        this.whildMonsterEncountered = Math.random() < 0.2;
        if (this.whildMonsterEncountered) {
            console.log(
                `[${WorldScene.name}:handlePlayerMovementUpdate] player is encountered a wild monster`
            );
            this.cameras.main.fadeOut(1000, 0, 0);
            this.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                () => {
                    this.scene.start(SCENE_KEYS.BATTLE_SCENE);
                }
            );
        }
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
            if(this.npcPlayerIsInteractingWith){
                this.npcPlayerIsInteractingWith.isTalkingToPlayer = false;
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
             this.dialogUI.showDialogModal(nearbyNpc.getMessages);
            // this.#handleNpcInteraction();
            return;
        }
    }

    private isPlayerInputLocked() {
        return this.dialogUI.getIsVisible;
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

            const npcFrame =
                npcObject.properties.find(
                    (property: TiledObjectProperty) =>
                        property.name === TILED_NPC_PROPERTY.FRAME
                )?.value || "0";
            const npcMessagesString =
                npcObject.properties.find(
                    (property: TiledObjectProperty) =>
                        property.name === TILED_NPC_PROPERTY.MESSAGES
                )?.value || "";
            const npcMessages = npcMessagesString.split("::");

            const npc = new NPC({
                scene: this,
                position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
                direction: DIRECTION.DOWN,
                frame: parseInt(npcFrame, 10),
                messages: npcMessages,
                otherCharactersToCheckForCollisionsWith: this.npcs,
                spriteGridMovementFinishedCallback: () => {},
                spriteChangedDirectionCallback: () => {},
            });

            this.npcs.push(npc);
        });
    }
}
