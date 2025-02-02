import { BattleMonsterConfig } from "../../interfaces/TypeDef";
import { BattleMonster } from "./BattleMonster";

export const ENEMY_POSITION = {
    x: 768,
    y: 144,
} as const;

export class EnemyBattleMonster extends BattleMonster {
    constructor(config: BattleMonsterConfig) {
        super(
            { ...config, scaleHealthBarBackgroundImageByY: 0.8 },
            ENEMY_POSITION
        );
    }

    public override playMonsterAppearAnimation(callback: () => void){
        const startPosX = 30;
        const endPosX = ENEMY_POSITION.x;
        this.phaserGameObject.setPosition(startPosX, ENEMY_POSITION.y);
        this.phaserGameObject.setAlpha(1);

        if(this.skipBattleAnimations){
            this.phaserGameObject.setX(endPosX);
            callback();
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 1000,
            x: {
                from: startPosX,
                start: startPosX,
                to: endPosX,
            },
            targets: this.phaserGameObject,
            onComplete: () => {
                if(callback){
                    callback();
                }
            }
        });
    }

    public override playMonsterHealthBarAppearAnimation(callback: () => void){
        const startPosX = -600;
        const endPosX = 0;
        this.phaserHealthBarGameContainer.setPosition(startPosX, this.phaserHealthBarGameContainer.y);
        this.phaserHealthBarGameContainer.setAlpha(1);

        if(this.skipBattleAnimations){
            this.phaserHealthBarGameContainer.setX(endPosX);
            callback();
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 1000,
            x: {
                from: startPosX,
                start: startPosX,
                to: endPosX,
            },
            targets: this.phaserHealthBarGameContainer,
            onComplete: () => {
                if(callback){
                    callback();
                }
            }
        });
    }

    public override playDeathAnimation(callback: () => void){
        const startPosY = this.phaserGameObject.y;
        const endPosY = startPosY - 400;

        if(this.skipBattleAnimations){
            this.phaserGameObject.setY(endPosY);
            callback();
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 2000,
            y: {
                from: startPosY,
                start: startPosY,
                to: endPosY,
            },
            targets: this.phaserGameObject,
            onComplete: () => {
                if(callback){
                    callback();
                }
            }
        });
    }
}
