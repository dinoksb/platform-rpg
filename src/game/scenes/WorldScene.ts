import { Scene } from "phaser";
import { SCENE_KEYS } from "./SceneKeys";
import { WORLD_ASSET_KEYS } from "../../assets/AssetsKeys";
import { Player } from "../world/characters/Player";
import { Controls } from "../../utils/Controls";
import { DIRECTION } from "../common/Direction";
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from "../../Config";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { DialogUI } from "../world/DialogUI";

export class WorldScene extends Scene {
    private player: Player;
    private controls: Controls;
    private encounterLayer: Phaser.Tilemaps.TilemapLayer;
    private whildMonsterEncountered: boolean;
    private dialogUI: DialogUI;
    private isShowStartMessage: boolean;

    constructor() {
        super({
            key: SCENE_KEYS.WORLD_SCENE,
        });
        this.isShowStartMessage = false;
    }

    init() {
        this.whildMonsterEncountered = false;
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
            }
        });

        this.cameras.main.startFollow(this.player.getSprite);

        // create foreground for depth
        this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

        // create dialog ui
        this.dialogUI = new DialogUI(this, 1280);

        this.controls = new Controls(this);
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        if(!this.isShowStartMessage){
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
                this.dialogUI.showDialogModal(['Start an exciting journey with your monster!']);
                this.isShowStartMessage = true;
            });
        }
        

    }

    update(time: DOMHighResTimeStamp) {
        if (this.whildMonsterEncountered) {
            this.player.update(time);
            return;
        }

        const selectedDirection = this.controls.getDirectionKeyPressDown();
        if (selectedDirection !== DIRECTION.NONE && !this.isPlayerInputLocked() && this.isShowStartMessage) {
            this.player.moveCharacter(selectedDirection);
        } 

        if(this.controls.wasSpaceKeyPressed() && !this.player.getIsMoving){
            this.handlePlayerInteraction();
        }

        this.player.update(time);
    }

    private handlePlayerMovementUpdate() {
        dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
            x: this.player.getSprite.x,
            y: this.player.getSprite.y,
        });

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

    private handlePlayerInteraction(){
        if(this.dialogUI.getIsAnimationPlayer){
            return;
        }

        if(this.dialogUI.getIsVisible && !this.dialogUI.getMoreMessagesToShow){
            this.dialogUI.hideDialogModal();
            return;
        }

        if(this.dialogUI.getIsVisible && this.dialogUI.getMoreMessagesToShow){
            this.dialogUI.showNextMessage();
            return;
        }

    }

    private isPlayerInputLocked(){
        return this.dialogUI.getIsVisible;
    }

    private handlePlayerDirectionUpdate(){
        console.log(('test'));
        
        dataManager.getStore.set(
            DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
            this.player.getDirection
        );
    }
}
