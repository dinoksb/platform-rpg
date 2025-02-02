import { TITLE_ASSET_KEYS, UI_ASSET_KEYS } from "../../assets/AssetKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/FontKeys";
import { NineSlice } from "../../utils/NineSlice";
import { BaseScene } from "./BaseScene";
import { SCENE_KEYS } from "./SceneKeys";
import { TitleSceneData } from "./TitleScene";

const TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "#4D4A49",
    fontSize: "30px",
} as const;

export class EndingScene extends BaseScene {
    private nineSliceTextBox: NineSlice;

    constructor() {
        super({
            key: SCENE_KEYS.ENDING_SCENE,
        });
    }

    init(): void {
        this.nineSliceTextBox = new NineSlice({
            cornerCutSize: 32,
            textureManager: this.sys.textures,
            assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND],
        });
    }

    create(): void {
        super.create();

        this.add
            .image(0, 0, TITLE_ASSET_KEYS.BACKGROUND)
            .setOrigin(0)
            .setScale(0.58);

        this.cameras.main.fadeIn(1000, 0, 0, 0, (progress: number) => {
            if (progress === 1) {
            }
        });

        const textBackgroundWidth = 500;
        const textBackgroundHeight = 200;
        const textBackgroundContainer =
            this.nineSliceTextBox.createNineSliceContainer(
                this,
                textBackgroundWidth,
                200,
                UI_ASSET_KEYS.MENU_BACKGROUND
            );
        const endingText = this.add
            .text(
                textBackgroundWidth / 2,
                textBackgroundHeight / 2,
                "Congrarts !!",
                TEXT_STYLE
            )
            .setOrigin(0.5);

        const textBoxContainer = this.add.container(0, 0, [
            textBackgroundContainer,
            endingText,
        ]);

        textBoxContainer.setPosition(
            this.scale.width / 2 - textBackgroundWidth / 2,
            this.scale.height / 2 - textBackgroundHeight / 2
        );

        // add in fade effects
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
                const sceneDataToPass: TitleSceneData = {
                    isGameOver: true
                };
                this.scene.start(SCENE_KEYS.TITLE_SCENE, sceneDataToPass);
            }
        );
    }

    update(): void {
        super.update();

        const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
        if (wasSpaceKeyPressed) {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            return;
        }
    }
}
