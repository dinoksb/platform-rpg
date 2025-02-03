import { HEALTH_BAR_ASSET_KEYS } from "../../assets/AssetKeys";
import { AnimatedBar } from "./AnimatedBar";

export class HealthBar extends AnimatedBar {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number = 360
    ) {
        super({
            scene,
            x,
            y,
            width,
            scaleY: 0.7,
            leftCapAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
            leftShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
            middleAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE,
            middleShadowAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
            rightCapAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
            rightShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
        });

        this.scene = scene;
        this.fullWidth = width;
        this.scaleY = 0.7;
    }
}
