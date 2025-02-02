import { HEALTH_BAR_ASSET_KEYS } from "../../../assets/AssetKeys";

export class HealthBar {
    private scene: Phaser.Scene;
    private healthBarContainer: Phaser.GameObjects.Container;
    private fullWidth: number;
    private scaleY: number;
    private leftCap: Phaser.GameObjects.Image;
    private middle: Phaser.GameObjects.Image;
    private rightCap: Phaser.GameObjects.Image;
    private leftShadowCap: Phaser.GameObjects.Image;
    private middleShadow: Phaser.GameObjects.Image;
    private rightShadowCap: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number= 360) {
        this.scene = scene;
        this.fullWidth = width;
        this.scaleY = 0.7;

        this.healthBarContainer = this.scene.add.container(x, y, []);
        this.createHealthBarShadowImages(x, y);
        this.createHealthBarImages(x, y);
        this.setMeterPercentage(1);
    }

    public get container() {
        return this.healthBarContainer;
    }

    public setMeterPercentageAnimated(
        percent: number,
        options: {
            duration?: number;
            skipBattleAnimations?: boolean;
            callback?: () => void;
        }
    ) {
        const width = this.fullWidth * percent;

        if (options?.skipBattleAnimations) {
            this.setMeterPercentage(percent);
            if (options?.callback) {
                options.callback();
            }
            return;
        }

        this.scene.tweens.add({
            targets: this.middle,
            displayWidth: width,
            duration: options?.duration || options?.duration === 0 ? 0 : 1000,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this.updateHealthBarGameObjects();
            },
            onComplete: options?.callback,
        });
    }

    private createHealthBarShadowImages(x: number, y: number) {
        this.leftShadowCap = this.scene.add
            .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);

        this.middleShadow = this.scene.add
            .image(
                this.leftShadowCap.x + this.leftShadowCap.width,
                y,
                HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW
            )
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);
        this.middleShadow.displayWidth = this.fullWidth;

        this.rightShadowCap = this.scene.add
            .image(
                this.middleShadow.x + this.middleShadow.displayWidth,
                y,
                HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW
            )
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);

        this.healthBarContainer.add([
            this.leftShadowCap,
            this.middleShadow,
            this.rightShadowCap,
        ]);
    }

    private createHealthBarImages(x: number, y: number) {
        this.leftCap = this.scene.add
            .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);
        this.middle = this.scene.add
            .image(
                this.leftCap.x + this.leftCap.width,
                y,
                HEALTH_BAR_ASSET_KEYS.MIDDLE
            )
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);
        this.middle.displayWidth = this.fullWidth;
        this.rightCap = this.scene.add
            .image(
                this.middle.x + this.middle.displayWidth,
                y,
                HEALTH_BAR_ASSET_KEYS.RIGHT_CAP
            )
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);

        this.healthBarContainer.add([this.leftCap, this.middle, this.rightCap]);
    }

    private setMeterPercentage(percent = 1) {
        const width = this.fullWidth * percent;

        this.middle.displayWidth = width;
        this.updateHealthBarGameObjects();
    }

    private updateHealthBarGameObjects() {
        this.rightCap.x = this.middle.x + this.middle.displayWidth;
        const isVisible = this.middle.displayWidth > 0;
        this.leftCap.visible = isVisible;
        this.middle.visible = isVisible;
        this.rightCap.visible = isVisible;
    }
}
