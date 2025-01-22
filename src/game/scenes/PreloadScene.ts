import { Scene } from "phaser";
import {
    ATTACK_ASSET_KEYS,
    BATTLE_ASSET_KEYS,
    BATTLE_BACKGROUND_ASSET_KEYS,
    DATA_ASSET_KEYS,
    HEALTH_BAR_ASSET_KEYS,
    MONSTER_ASSET_KEYS,
    UI_ASSET_KEYS,
} from "../../assets/AssetsKeys";
import { SCENE_KEYS } from "./SceneKeys";
import { WebFontFileLoader } from "../../assets/WebFontFileLoader";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/FontKeys";

export class PreloadScene extends Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {
        console.log(`[${PreloadScene.name}:preload] invoked`);
        const monsterTamerAssetsPath = "assets/images/monster-tamer";
        const kenneysAssetPath = "assets/images/kenneys-assets";
        const pimenAssetPath = "assets/images/pimen"

        // battle backgrounds
        this.load.image(
            BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
            `${monsterTamerAssetsPath}/battle-backgrounds/forest-background.png`
        );

        // battle assets
        this.load.image(
            BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
            `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`
        );

        // health bar assets
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`
        );

        this.load.image(
            HEALTH_BAR_ASSET_KEYS.MIDDLE,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`
        );

        this.load.image(
            HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`
        );

        this.load.image(
            HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`
        );

        this.load.image(
            HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`
        );

        this.load.image(
            HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`
        );

        // monster assets
        this.load.image(
            MONSTER_ASSET_KEYS.CARNODUSK,
            `${monsterTamerAssetsPath}/monsters/carnodusk.png`
        );

        this.load.image(
            MONSTER_ASSET_KEYS.IGUANIGNITE,
            `${monsterTamerAssetsPath}/monsters/iguanignite.png`
        );

        // ui assets
        this.load.image(
            UI_ASSET_KEYS.CURSOR,
            `${monsterTamerAssetsPath}/ui/cursor.png`
        );

        // load json data
        this.load.json(DATA_ASSET_KEYS.ATTACKS, "assets/data/attacks.json");

        // load custom font
        this.load.addFile(new WebFontFileLoader(this.load, [KENNEY_FUTURE_NARROW_FONT_NAME]));

        // load attack assets
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD, `${pimenAssetPath}/ice-attack/active.png`, {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD_START, `${pimenAssetPath}/ice-attack/start.png`, {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet(ATTACK_ASSET_KEYS.SLASH, `${pimenAssetPath}/slash.png`, {
            frameWidth: 48,
            frameHeight: 48,
        });
    }

    create() {
        console.log(`[${PreloadScene.name}:create] invoked`);
        this.scene.start(SCENE_KEYS.BATTLE_SCENE);
    }
}
