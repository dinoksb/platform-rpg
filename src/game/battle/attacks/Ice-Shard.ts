import { ATTACK_ASSET_KEYS } from "../../../assets/AssetKeys";
import { Coordinate } from "../../interfaces/Coordinate";
import { Attack } from "./Attack";

export class IceShard extends Attack {
    attackGameObject: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, position: Coordinate) {
        super(scene, position);

        // create animations
        this.scene.anims.create({
            key: ATTACK_ASSET_KEYS.ICE_SHARD,
            frames: this.scene.anims.generateFrameNumbers(
                ATTACK_ASSET_KEYS.ICE_SHARD
            ),
            frameRate: 8,
            repeat: 0,
            delay: 0,
        });

        this.scene.anims.create({
            key: ATTACK_ASSET_KEYS.ICE_SHARD_START,
            frames: this.scene.anims.generateFrameNumbers(
                ATTACK_ASSET_KEYS.ICE_SHARD_START
            ),
            frameRate: 8,
            repeat: 0,
            delay: 0,
        });

        // create gameobjects
        this.attackGameObject = this.scene.add
            .sprite(
                this.position.x,
                this.position.y,
                ATTACK_ASSET_KEYS.ICE_SHARD,
                5
            )
            .setOrigin(0.5)
            .setScale(4)
            .setAlpha(0);
    }

    public override playAnimation(callback: () => void): void {
        if (this.isAnimationPlaying) {
            return;
        }

        this.isAnimationPlaying = true;
        this.attackGameObject.setAlpha(1);

        this.attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD_START);
        this.attackGameObject.once(
            Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
                ATTACK_ASSET_KEYS.ICE_SHARD_START,
            () => {
                this.attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD);
            }
        );

        this.attackGameObject.once(
            Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
                ATTACK_ASSET_KEYS.ICE_SHARD_START,
            () => {
                this.isAnimationPlaying = false;
                this.attackGameObject.setAlpha(0).setFrame(0);

                if(callback){
                    callback();
                }
            }
        );
    }
}
