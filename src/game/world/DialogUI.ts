import { UI_ASSET_KEYS } from "../../assets/AssetsKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/FontKeys";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { animateText, CANNOT_READ_SIGN_TEXT } from "../../utils/TextUtils";

const UI_TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "black",
    fontSize: "32px",
    wordWrap: { width: 0 },
} as const;

export type UITextStyle =
    (typeof Phaser.GameObjects.TextStyle)[keyof typeof Phaser.GameObjects.TextStyle];

export class DialogUI {
    private scene: Phaser.Scene;
    private padding: number;
    private width: number;
    private height: number;
    private container: Phaser.GameObjects.Container;
    private isVisible: boolean;
    private userInputCursor: Phaser.GameObjects.Image;
    private userInputCursorTween: Phaser.Tweens.Tween;
    private uiText: Phaser.GameObjects.Text;
    private textAnimationPlaying: boolean;
    private messagesToShow: string[];
    private textAnimationSpeed: number;

    constructor(scene: Phaser.Scene, width: number) {
        this.scene = scene;
        this.padding = 90;
        this.width = width - this.padding * 2;
        this.height = 124;
        this.textAnimationPlaying = false;
        this.messagesToShow = [];

        const panel = this.scene.add
            .rectangle(0, 0, this.width, this.height, 0xede4f3, 0.9)
            .setOrigin(0)
            .setStrokeStyle(8, 0x905ac2, 1);
        this.container = this.scene.add.container(0, 0, [panel]);
        this.uiText = this.scene.add.text(18, 12, CANNOT_READ_SIGN_TEXT, {
            ...UI_TEXT_STYLE,
            ...{ wordWrap: { width: this.width - 18 } },
        });
        this.container.add(this.uiText);
        this.createPlayerInputCursor();
        this.hideDialogModal();
        this.textAnimationSpeed = dataManager.getStore.get(
            DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED
        );
    }

    public get getIsVisible(): boolean {
        return this.isVisible;
    }

    public get getIsAnimationPlaying(){
        return this. textAnimationPlaying;
    }

    public get getMoreMessagesToShow(){
        return this.messagesToShow.length > 0;
    }

    public showDialogModal(messages: string[]) {
        this.messagesToShow = [...messages];

        const { x, bottom } = this.scene.cameras.main.worldView;
        const startX = x + this.padding;
        const startY = bottom - this.height - this.padding / 4;

        this.container.setPosition(startX, startY);
        this.userInputCursorTween.restart();
        this.container.setAlpha(1);
        this.isVisible = true;

        this.showNextMessage();
    }

    public hideDialogModal() {
        this.container.setAlpha(0);
        this.userInputCursorTween.pause();
        this.isVisible = false;
    }

    public showNextMessage() {
        if(this.messagesToShow.length === 0){
            return;
        }

        this.uiText.setText('').setAlpha(1);        
        animateText(this.scene, this.uiText, this.messagesToShow.shift() || '', {
            delay: this.textAnimationSpeed,
            callback: () => {
                this.textAnimationPlaying = false;
            },
        });
        this.textAnimationPlaying = true;
    }

    private createPlayerInputCursor() {
        const y = this.height - 24;
        this.userInputCursor = this.scene.add.image(
            this.width - 16,
            y,
            UI_ASSET_KEYS.CURSOR
        );
        this.userInputCursor.setAngle(90).setScale(4.5, 2);

        this.userInputCursorTween = this.scene.add.tween({
            delay: 0,
            duration: 500,
            repeat: -1,
            y: {
                from: y,
                start: y,
                to: y + 6,
            },
            targets: this.userInputCursor,
        });
        this.userInputCursorTween.pause();
        this.container.add(this.userInputCursor);
    }
}
