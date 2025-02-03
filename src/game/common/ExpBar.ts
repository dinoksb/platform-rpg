import { EXP_BAR_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS } from "../../assets/AssetKeys";
import { AnimatedBar } from "./AnimatedBar";

export class ExpBar extends AnimatedBar {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number = 360,
        scaleY: number = 0.4
    ) {
        super({
            scene,
            x,
            y,
            width,
            scaleY,
            leftCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
            leftShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
            middleAssetKey: EXP_BAR_ASSET_KEYS.EXP_MIDDLE,
            middleShadowAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
            rightCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_RIGHT_CAP,
            rightShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
        });

        this.scene = scene;
        this.fullWidth = width;
        this.scaleY = 0.7;
    }
}
