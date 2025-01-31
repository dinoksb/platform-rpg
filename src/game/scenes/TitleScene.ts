import { TITLE_ASSET_KEYS, UI_ASSET_KEYS } from "../../assets/AssetsKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/FontKeys";
import { NineSlice } from "../../utils/NineSlice";
import { BaseScene } from "./BaseScene";
import { SCENE_KEYS } from "./SceneKeys";

const PLAYER_INPUT_CURSOR_POSITION = {
    x: 130,
} as const;

export const MENU_TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "#4D4A49",
    fontSize: "30px",
} as const;

export type MenuTextStyle =
    (typeof Phaser.GameObjects.TextStyle)[keyof typeof Phaser.GameObjects.TextStyle];

export class TitleScene extends BaseScene {
    private mainMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private nineSliceMenu: NineSlice;

    constructor() {
        super({
            key: SCENE_KEYS.TITLE_SCENE,
        });
    }

    init() {
        super.init();

        this.nineSliceMenu = new NineSlice({
            cornerCutSize: 32,
            textureManager: this.sys.textures,
            assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND],
        });
    }

    create() {
        super.create();

        // create background and title
        this.add
            .image(0, 0, TITLE_ASSET_KEYS.BACKGROUND)
            .setOrigin(0)
            .setScale(0.58);
        const panelImage = this.add
            .image(this.scale.width / 2, 150, TITLE_ASSET_KEYS.PANEL)
            .setScale(0.25, 0.25)
            .setAlpha(0.5);
        this.add
            .text(panelImage.x, panelImage.y, "Platform-RPG", MENU_TEXT_STYLE)
            .setScale(1.2, 1.2)
            .setOrigin(0.46, 0.55);

        // create menu
        const menuBackgroundWidth = 500;
        // TODO: replace with a nineslice image
        // const menuBackground = this.add.image(240, 100, UI_ASSET_KEYS.MENU_BACKGROUND).setOrigin(0.5).setScale(3, 1);
        // const menuBackgroundContainer = this.add.container(0, 0, [menuBackground])
        const menuBackgroundContainer =
            this.nineSliceMenu.createNineSliceContainer(
                this,
                menuBackgroundWidth,
                200,
                UI_ASSET_KEYS.MENU_BACKGROUND
            );
        const newGameText = this.add
            .text(menuBackgroundWidth / 2, 100, "Start Game", MENU_TEXT_STYLE)
            .setOrigin(0.5);

        const menuContainer = this.add.container(0, 0, [
            menuBackgroundContainer,
            newGameText,
        ]);
        menuContainer.setPosition(
            this.scale.width / 2 - menuBackgroundWidth / 2,
            300
        );

        // create cursor
        this.mainMenuCursorPhaserImageGameObject = this.add
            .image(PLAYER_INPUT_CURSOR_POSITION.x, 100, UI_ASSET_KEYS.CURSOR)
            .setOrigin(0.5)
            .setScale(2.5);
        menuBackgroundContainer.add(this.mainMenuCursorPhaserImageGameObject);
        this.tweens.add({
            delay: 0,
            duration: 500,
            repeat: -1,
            x: {
                from: PLAYER_INPUT_CURSOR_POSITION.x,
                start: PLAYER_INPUT_CURSOR_POSITION.x,
                to: PLAYER_INPUT_CURSOR_POSITION.x + 3,
            },
            targets: this.mainMenuCursorPhaserImageGameObject,
        });

        // add in fade effects
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
                this.scene.start(SCENE_KEYS.WORLD_SCENE);
            }
        );
    }

    update() {
        super.update();

        if(this.controls.IsInputLocked){
            return;
        }
        
        const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
        if (wasSpaceKeyPressed) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.controls.lockInput = true;
            return;
        }
    }
}
