export interface AnimatedBarConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width: number;
    scaleY?: number;
    leftCapAssetKey: string;
    middleAssetKey: string;
    rightCapAssetKey: string;
    leftShadowCapAssetKey: string;
    middleShadowAssetKey: string;
    rightShadowCapAssetKey: string;
}


export abstract class AnimatedBar {
    protected scene: Phaser.Scene;
    protected container: Phaser.GameObjects.Container;
    protected fullWidth: number;
    protected scaleY: number;
    protected leftCap: Phaser.GameObjects.Image;
    protected middle: Phaser.GameObjects.Image;
    protected rightCap: Phaser.GameObjects.Image;
    protected leftShadowCap: Phaser.GameObjects.Image;
    protected middleShadow: Phaser.GameObjects.Image;
    protected rightShadowCap: Phaser.GameObjects.Image;
    protected config: AnimatedBarConfig;

    constructor(config: AnimatedBarConfig) {
        if(this.constructor === AnimatedBar){
            throw new Error('AnimatedBart is an abstract class and cannot be instantiate');
        }
        this.scene = config.scene;
        this.fullWidth = config.width;
        this.scaleY = config.scaleY ?? 1;
        this.config = config;

        this.container = this.scene.add.container(config.x, config.y, []);
        this.createBarShadowImages(config.x, config.y);
        this.createBarImages(config.x, config.y);
        this.setMeterPercentage(1);
    }

    public get getContainer() {
        return this.container;
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
                this.updateBarGameObjects();
            },
            onComplete: options?.callback,
        });
    }

    protected createBarShadowImages(x: number, y: number) {
        this.leftShadowCap = this.scene.add
            .image(x, y, this.config.leftShadowCapAssetKey)
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);

        this.middleShadow = this.scene.add
            .image(
                this.leftShadowCap.x + this.leftShadowCap.width,
                y,
                this.config.middleShadowAssetKey
            )
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);
        this.middleShadow.displayWidth = this.fullWidth;

        this.rightShadowCap = this.scene.add
            .image(
                this.middleShadow.x + this.middleShadow.displayWidth,
                y,
                this.config.rightShadowCapAssetKey
            )
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);

        this.container.add([
            this.leftShadowCap,
            this.middleShadow,
            this.rightShadowCap,
        ]);
    }

    protected createBarImages(x: number, y: number) {
        this.leftCap = this.scene.add
            .image(x, y, this.config.leftCapAssetKey)
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);
        this.middle = this.scene.add
            .image(
                this.leftCap.x + this.leftCap.width,
                y,
                this.config.middleAssetKey
            )
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);
        this.middle.displayWidth = this.fullWidth;
        this.rightCap = this.scene.add
            .image(
                this.middle.x + this.middle.displayWidth,
                y,
                this.config.rightCapAssetKey
            )
            .setOrigin(0, 0.5)
            .setScale(1, this.scaleY);

        this.container.add([this.leftCap, this.middle, this.rightCap]);
    }

    protected setMeterPercentage(percent = 1) {
        const width = this.fullWidth * percent;

        this.middle.displayWidth = width;
        this.updateBarGameObjects();
    }

    protected updateBarGameObjects() {
        this.rightCap.x = this.middle.x + this.middle.displayWidth;
        const isVisible = this.middle.displayWidth > 0;
        this.leftCap.visible = isVisible;
        this.middle.visible = isVisible;
        this.rightCap.visible = isVisible;
    }
}
