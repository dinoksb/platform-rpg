import { ATTACK_ASSET_KEYS } from "../../../assets/AssetsKeys";
import { Coordinate } from "../../interfaces/Coordinate";
import { Attack } from "./Attack";

export class Slash extends Attack {
    attackGameObject: Phaser.GameObjects.Container;
    attackGameObject1: Phaser.GameObjects.Sprite;
    attackGameObject2: Phaser.GameObjects.Sprite;
    attackGameObject3: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, position: Coordinate) {
        super(scene, position);

        // create animations
        this.scene.anims.create({
            key: ATTACK_ASSET_KEYS.SLASH,
            frames: this.scene.anims.generateFrameNumbers(
                ATTACK_ASSET_KEYS.SLASH
            ),
            frameRate: 4,
            repeat: 0,
            delay: 0,
        });

        // create gameobjects
        this.attackGameObject1 = this.scene.add
            .sprite(0, 0, ATTACK_ASSET_KEYS.SLASH, 0)
            .setOrigin(0.5)
            .setScale(4);
        this.attackGameObject2 = this.scene.add
            .sprite(30, 0, ATTACK_ASSET_KEYS.SLASH, 0)
            .setOrigin(0.5)
            .setScale(4);
        this.attackGameObject3 = this.scene.add
            .sprite(-30, 0, ATTACK_ASSET_KEYS.SLASH, 0)
            .setOrigin(0.5)
            .setScale(4);
        this.attackGameObject = this.scene.add.container(
            this.position.x,
            this.position.y,
            [
                this.attackGameObject1,
                this.attackGameObject2,
                this.attackGameObject3,
            ]
        ).setAlpha(0);
    }

    public override playAnimation(callback: () => void): void {
        if (this.isAnimationPlaying) {
            return;
        }

        this.isAnimationPlaying = true;
        this.attackGameObject.setAlpha(1);

        this.attackGameObject1.play(ATTACK_ASSET_KEYS.SLASH);
        this.attackGameObject2.play(ATTACK_ASSET_KEYS.SLASH);
        this.attackGameObject3.play(ATTACK_ASSET_KEYS.SLASH);

        this.attackGameObject1.once(
            Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
                ATTACK_ASSET_KEYS.SLASH,
            () => {
                this.isAnimationPlaying = false;
                this.attackGameObject.setAlpha(0);
                this.attackGameObject1.setFrame(0);
                this.attackGameObject2.setFrame(0);
                this.attackGameObject3.setFrame(0);

                if(callback){
                    callback();
                }
            }
        );
    }
}
