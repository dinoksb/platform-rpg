import {
    ATTACK_ASSET_KEYS,
    BATTLE_ASSET_KEYS,
    BATTLE_BACKGROUND_ASSET_KEYS,
    CHARACTER_ASSET_KEYS,
    DATA_ASSET_KEYS,
    HEALTH_BAR_ASSET_KEYS,
    INVENTORY_ASSET_KEYS,
    MONSTER_ASSET_KEYS,
    MONSTER_PARTY_ASSET_KEYS,
    TITLE_ASSET_KEYS,
    UI_ASSET_KEYS,
    WORLD_ASSET_KEYS,
} from "../../assets/AssetKeys";
import { SCENE_KEYS } from "./SceneKeys";
import { WebFontFileLoader } from "../../assets/WebFontFileLoader";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/FontKeys";
import { DataUtils } from "../../utils/DataUtils";
import { Animation } from "../interfaces/TypeDef";
import { BaseScene } from "./BaseScene";
import { dataManager } from "../../utils/DataManager";

export class PreloadScene extends BaseScene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {
        super.preload();
        const monsterTamerAssetsPath = "assets/images/monster-tamer";
        const kenneysAssetPath = "assets/images/kenneys-assets";
        const pimenAssetPath = "assets/images/pimen";
        const axulArtAssetPath = "assets/images/axulart";
        const pbGameAssetPath = "assets/images/parabellum-games";

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

        this.load.image(
            MONSTER_ASSET_KEYS.AQUAVALOR,
            `${monsterTamerAssetsPath}/monsters/aquavalor.png`
        );

        this.load.image(
            MONSTER_ASSET_KEYS.FROSTSABER,
            `${monsterTamerAssetsPath}/monsters/frostsaber.png`
        );

        this.load.image(
            MONSTER_ASSET_KEYS.IGNIVOLT,
            `${monsterTamerAssetsPath}/monsters/ignivolt.png`
        );

        // ui assets
        this.load.image(
            UI_ASSET_KEYS.CURSOR,
            `${monsterTamerAssetsPath}/ui/cursor.png`
        );
        this.load.image(
            UI_ASSET_KEYS.CURSOR_WHITE,
            `${monsterTamerAssetsPath}/ui/cursor_white.png`
        );
        this.load.image(
            UI_ASSET_KEYS.MENU_BACKGROUND,
            `${kenneysAssetPath}/ui-space-expansion/glassPanel.png`
        );
        this.load.image(
            UI_ASSET_KEYS.BLUE_BUTTON,
            `${kenneysAssetPath}/ui-pack/blue_button01.png`
        );
        this.load.image(
            UI_ASSET_KEYS.BLUE_BUTTON_SELECTED,
            `${kenneysAssetPath}/ui-pack/blue_button00.png`
        );

        // load json data
        this.load.json(DATA_ASSET_KEYS.ATTACKS, "assets/data/attacks.json");
        this.load.json(
            DATA_ASSET_KEYS.PLAYER_ANIMATIONS,
            "assets/data/player-animations.json"
        );
        this.load.json(
            DATA_ASSET_KEYS.ICESHARD_ANIMATIONS,
            "assets/data/iceshard-animations.json"
        );
        this.load.json(
            DATA_ASSET_KEYS.SLASH_ANIMATIONS,
            "assets/data/slash-animations.json"
        );
        this.load.json(
            DATA_ASSET_KEYS.NPC_ANIMATIONS,
            "assets/data/npc-animations.json"
        );
        this.load.json(DATA_ASSET_KEYS.ITEMS, "assets/data/items.json");
        this.load.json(DATA_ASSET_KEYS.MONSTERS, "assets/data/monsters.json");
        this.load.json(DATA_ASSET_KEYS.ENCOUNTERS, "assets/data/encounters.json");

        // load custom font
        this.load.addFile(
            new WebFontFileLoader(this.load, [KENNEY_FUTURE_NARROW_FONT_NAME])
        );

        // load attack assets
        this.load.spritesheet(
            ATTACK_ASSET_KEYS.ICE_SHARD,
            `${pimenAssetPath}/ice-attack/active.png`,
            {
                frameWidth: 32,
                frameHeight: 32,
            }
        );
        this.load.spritesheet(
            ATTACK_ASSET_KEYS.ICE_SHARD_START,
            `${pimenAssetPath}/ice-attack/start.png`,
            {
                frameWidth: 32,
                frameHeight: 32,
            }
        );
        this.load.spritesheet(
            ATTACK_ASSET_KEYS.SLASH,
            `${pimenAssetPath}/slash.png`,
            {
                frameWidth: 48,
                frameHeight: 48,
            }
        );

        // load world assets
        this.load.image(
            WORLD_ASSET_KEYS.WORLD_BACKGROUND,
            `${monsterTamerAssetsPath}/map/level_background.png`
        );
        this.load.image(
            WORLD_ASSET_KEYS.WORLD_FOREGROUND,
            `${monsterTamerAssetsPath}/map/level_foreground.png`
        );
        this.load.image(
            WORLD_ASSET_KEYS.WORLD_COLLISION,
            `${monsterTamerAssetsPath}/map/collision.png`
        );
        this.load.image(
            WORLD_ASSET_KEYS.WORLD_BOULDER_COLLISION,
            `${monsterTamerAssetsPath}/map/boulder.png`
        );
        this.load.tilemapTiledJSON(
            WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,
            `assets/data/platform_rpg_town_level.json`
        );
        this.load.image(
            WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE,
            `${monsterTamerAssetsPath}/map/encounter.png`
        );

        // load character images
        this.load.spritesheet(
            CHARACTER_ASSET_KEYS.PLAYER,
            `${axulArtAssetPath}/character/custom.png`,
            {
                frameWidth: 64,
                frameHeight: 88,
            }
        );
        this.load.spritesheet(
            CHARACTER_ASSET_KEYS.NPC,
            `${pbGameAssetPath}/characters.png`,
            {
                frameWidth: 16,
                frameHeight: 16,
            }
        );

        // ui components for title
        this.load.image(TITLE_ASSET_KEYS.BACKGROUND, `${monsterTamerAssetsPath}/ui/title/background.png`);
        this.load.image(TITLE_ASSET_KEYS.PANEL, `${monsterTamerAssetsPath}/ui/title/title_background.png`);
        this.load.image(TITLE_ASSET_KEYS.TITLE, `${monsterTamerAssetsPath}/ui/title/title_text.png`);

        // ui components for monster party
        this.load.image(MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND, `${monsterTamerAssetsPath}/ui/monster-party/background.png`);
        this.load.image(MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILS_BACKGROUND, `${monsterTamerAssetsPath}/ui/monster-party/monster-details-background.png`);

        // ui components for inventory
        this.load.image(INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND, `${monsterTamerAssetsPath}/ui/inventory/bag_background.png`);
        this.load.image(INVENTORY_ASSET_KEYS.INVENTORY_BAG, `${monsterTamerAssetsPath}/ui/inventory/bag.png`);
    }

    create() {
        super.create();
        this.createAnimations();

        dataManager.init(this);
        dataManager.loadData();

        this.scene.start(SCENE_KEYS.WORLD_SCENE);
    }

    private createAnimations() {
        // create player playerAnimations.

        const animationsContainer = [
            DataUtils.getAnimations(this, DATA_ASSET_KEYS.PLAYER_ANIMATIONS),
            DataUtils.getAnimations(this, DATA_ASSET_KEYS.ICESHARD_ANIMATIONS),
            DataUtils.getAnimations(this, DATA_ASSET_KEYS.SLASH_ANIMATIONS),
            DataUtils.getAnimations(this, DATA_ASSET_KEYS.NPC_ANIMATIONS),
        ].flat();

        animationsContainer.forEach((animation: Animation) => {
            const frames = animation.frames
                ? this.anims.generateFrameNumbers(animation.assetKey, {
                      frames: animation.frames,
                  })
                : this.anims.generateFrameNumbers(animation.assetKey);
            this.anims.create({
                key: animation.key,
                frames: frames,
                frameRate: animation.frameRate,
                repeat: animation.repeat,
                delay: animation.delay,
                yoyo: animation.yoyo,
            });
        });
    }
}
