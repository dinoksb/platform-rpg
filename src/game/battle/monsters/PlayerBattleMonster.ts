import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../../assets/FontKeys";
import { BattleMonsterConfig } from "../../interfaces/TypeDef";
import { BattleMonster } from "./BattleMonster";

export const PLAYER_POSITION = {
    x: 256,
    y: 316,
} as const;

export class PlayerBattleMonster extends BattleMonster {
    private healthBarTextGameObject: Phaser.GameObjects.Text;

    constructor(config: BattleMonsterConfig) {
        super(config, PLAYER_POSITION);
        this.phaserGameObject.setFlipX(true);
        this.phaserHealthBarGameContainer.setPosition(556, 318);

        this.addHealthBarComponents();
    }

    public takeDamage(damage: number, callback: () => void) {
        // update current monster health and animate health bar
        super.takeDamage(damage, callback);
        this.setHealthBarText();
    }

    public updateMonsterHealth(updateHp: number){
        this.currentHealth = updateHp;
        if(this.currentHealth > this.maxHealth){
            this.currentHealth = this.maxHealth;
        }

        this.healthBar.setMeterPercentageAnimated(this.currentHealth / this.maxHealth, {
            skipBattleAnimations: true
        });
        this.setHealthBarText();
    }

    public override playMonsterAppearAnimation(callback: () => void){
        const startPosX = 30;
        const endPosX = PLAYER_POSITION.x;
        this.phaserGameObject.setPosition(startPosX, PLAYER_POSITION.y);
        this.phaserGameObject.setAlpha(1);

        if(this.skipBattleAnimations){
            this.phaserGameObject.setX(endPosX);
            callback();
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 800,
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
        const startPosX = 800;
        const endPosX =  this.phaserHealthBarGameContainer.x;
        this.phaserHealthBarGameContainer.setPosition(startPosX, this.phaserHealthBarGameContainer.y);
        this.phaserHealthBarGameContainer.setAlpha(1);

        if(this.skipBattleAnimations){
            this.phaserHealthBarGameContainer.setX(endPosX);
            callback();
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 800,
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
        const endPosY = startPosY + 400;

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

    private addHealthBarComponents() {
        this.healthBarTextGameObject = this.scene.add
            .text(443, 80, "25/25", {
                fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
                color: "#7E3D3F",
                fontSize: "16px",
                fontStyle: "italic",
            })
            .setOrigin(1, 0);
        this.setHealthBarText();
        this.phaserHealthBarGameContainer.add(this.healthBarTextGameObject);
    }

    private setHealthBarText() {
        this.healthBarTextGameObject.setText(
            `${this.currentHealth}/${this.maxHealth}`
        );
    }
}
