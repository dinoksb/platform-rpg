import { TITLE_ASSET_KEYS, UI_ASSET_KEYS } from "../../assets/AssetKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/FontKeys";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { exhaustiveGuard } from "../../utils/Guard";
import { NineSlice } from "../../utils/NineSlice";
import { DIRECTION, Direction } from "../common/Direction";
import { BaseScene } from "./BaseScene";
import { SCENE_KEYS } from "./SceneKeys";

const PLAYER_INPUT_CURSOR_POSITION = {
    x: 130,
    y: 41,
} as const;

const MENU_TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "#4D4A49",
    fontSize: "30px",
} as const;

const MAIN_MENU_OPTIONS = {
    NEW_GAME: "NEW_GAME",
    CONTINUE: "CONTINUE",
} as const;
export type MainMenuOptions =
    (typeof MAIN_MENU_OPTIONS)[keyof typeof MAIN_MENU_OPTIONS];

export type MenuTextStyle =
    (typeof Phaser.GameObjects.TextStyle)[keyof typeof Phaser.GameObjects.TextStyle];


export class TitleScene extends BaseScene {
    private mainMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private nineSliceMenu: NineSlice;
    private selectedMenuOption: MainMenuOptions;
    private isContinueButtonEnabled: boolean;

    constructor() {
        super({
            key: SCENE_KEYS.TITLE_SCENE,
        });
    }

    init() {
        super.init(undefined);

        this.nineSliceMenu = new NineSlice({
            cornerCutSize: 32,
            textureManager: this.sys.textures,
            assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND],
        });
    }

    create() {
        super.create();

        this.selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
        this.isContinueButtonEnabled =
            dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED) ||
            false;

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
        const menuBackgroundContainer =
            this.nineSliceMenu.createNineSliceContainer(
                this,
                menuBackgroundWidth,
                200,
                UI_ASSET_KEYS.MENU_BACKGROUND
            );
        const newGameText = this.add
            .text(menuBackgroundWidth / 2, 40, "New Game", MENU_TEXT_STYLE)
            .setOrigin(0.5);
        const continueText = this.add
            .text(menuBackgroundWidth / 2, 90, "Continue", MENU_TEXT_STYLE)
            .setOrigin(0.5);
        if (!this.isContinueButtonEnabled) {
            continueText.setAlpha(0.5);
        }

        const menuContainer = this.add.container(0, 0, [
            menuBackgroundContainer,
            newGameText,
            continueText,
        ]);
        menuContainer.setPosition(
            this.scale.width / 2 - menuBackgroundWidth / 2,
            300
        );

        // create cursor
        this.mainMenuCursorPhaserImageGameObject = this.add
            .image(
                PLAYER_INPUT_CURSOR_POSITION.x,
                PLAYER_INPUT_CURSOR_POSITION.y,
                UI_ASSET_KEYS.CURSOR
            )
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
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
                    dataManager.startNewGame();
                }
                this.scene.start(SCENE_KEYS.WORLD_SCENE);
            }
        );
    }

    update() {
        super.update();

        if (this.controls.isInputLocked) {
            return;
        }

        const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
        if (wasSpaceKeyPressed) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.controls.lockInput = true;
            return;
        }

        const selectedDirection = this.controls.getDirectionKeyJustPressed();
        if (selectedDirection !== DIRECTION.NONE) {
            this.moveMenuSelectCursor(selectedDirection);
        }
    }

    private moveMenuSelectCursor(direction: Direction): void {
        this.updateSelectedMenuOptionFromInput(direction);
        switch (this.selectedMenuOption) {
            case MAIN_MENU_OPTIONS.NEW_GAME:
                this.mainMenuCursorPhaserImageGameObject.setY(
                    PLAYER_INPUT_CURSOR_POSITION.y
                );
                break;
            case MAIN_MENU_OPTIONS.CONTINUE:
                this.mainMenuCursorPhaserImageGameObject.setY(91);
                break;
            default:
                exhaustiveGuard(this.selectedMenuOption);
        }
    }

    private updateSelectedMenuOptionFromInput(direction: Direction): void {
        switch (direction) {
            case DIRECTION.UP:
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
                    return;
                }
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
                    this.selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
                    return;
                }
                this.selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE;
                return;
            case DIRECTION.DOWN:
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
                    return;
                }
                if (
                    this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME &&
                    this.isContinueButtonEnabled
                ) {
                    this.selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE;
                    return;
                }
                return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
            case DIRECTION.NONE:
                return;
            default:
                exhaustiveGuard(direction);
        }
    }
}
