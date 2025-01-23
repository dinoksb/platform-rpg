import { Scene } from "phaser";
import { SCENE_KEYS } from "./SceneKeys";
import { WORLD_ASSET_KEYS } from "../../assets/AssetsKeys";
import { Player } from "../world/characters/Player";
import { Controls } from "../../utils/Controls";
import { DIRECTION } from "../common/Direction";
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from "../../Config";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";

export class WorldScene extends Scene {
    private player: Player;
    private controls: Controls;
    private encounterLayer: Phaser.Tilemaps.TilemapLayer;
    private whildMonsterEncountered: boolean;

    constructor() {
        super({
            key: SCENE_KEYS.WORLD_SCENE,
        });
    }

    init() {
        this.whildMonsterEncountered = false;
    }

    create() {
        console.log(`[${WorldScene.name}:create] invoked`);

        const x = 6 * TILE_SIZE;
        const y = 22 * TILE_SIZE;
        this.cameras.main.setBounds(0, 0, 1280, 2176);
        this.cameras.main.setZoom(0.3);
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
        });

        this.cameras.main.startFollow(this.player.getSprite);

        this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

        this.controls = new Controls(this);
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    update(time: DOMHighResTimeStamp) {
        if (this.whildMonsterEncountered) {
            this.player.update(time);
            return;
        }

        const selectedDirection = this.controls.getDirectionKeyPressDown();
        if (selectedDirection !== DIRECTION.NONE) {
            this.player.moveCharacter(selectedDirection);
        }

        this.player.update(time);
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
}
