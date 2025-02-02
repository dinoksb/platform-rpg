import { BATTLE_ASSET_KEYS } from "../../../assets/AssetKeys";
import { Attack, BattleMonsterConfig, Monster } from "../../interfaces/TypeDef";
import { HealthBar } from "../ui/HealthBar";
import { DataUtils } from "../../../utils/DataUtils";
import { Coordinate } from "../../interfaces/Coordinate";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../../assets/FontKeys";

export class BattleMonster {
    protected scene: Phaser.Scene;
    protected monsterDetails: Monster;
    protected phaserGameObject: Phaser.GameObjects.Image;
    protected healthBar: HealthBar;
    protected currentHealth: number;
    protected maxHealth: number;
    protected monsterAttacks: Attack[];
    protected phaserHealthBarGameContainer: Phaser.GameObjects.Container;
    protected skipBattleAnimations: boolean;

    constructor(config: BattleMonsterConfig, position: Coordinate) {
        this.scene = config.scene;
        this.monsterDetails = config.monsterDetails;
        this.currentHealth = this.monsterDetails.currentHp;
        this.maxHealth = this.monsterDetails.maxHp;
        this.monsterAttacks = [];
        this.skipBattleAnimations = config.skipBattleAnimation || false;

        this.phaserGameObject = this.scene.add
            .image(
                position.x,
                position.y,
                this.monsterDetails.assetKey,
                this.monsterDetails.assetFrame || 0
            )
            .setAlpha(0);

        let scaleY = 1.0;
        if (config.scaleHealthBarBackgroundImageByY !== undefined) {
            scaleY = config.scaleHealthBarBackgroundImageByY;
        }
        this.createHealthBarComponents(scaleY);


        this.healthBar.setMeterPercentageAnimated(this.currentHealth / this.maxHealth, {
            skipbattleAnimations: true,
        });

        this.monsterDetails.attackIds.forEach((attackId) => {
            const monsterAttack = DataUtils.getMonsterAttack(
                this.scene,
                attackId
            );
            if (monsterAttack !== undefined) {
                this.monsterAttacks.push(monsterAttack);
            }
        });
    }

    public get isFainted(): boolean {
        return this.currentHealth <= 0;
    }

    public get name(): string {
        return this.monsterDetails.name;
    }

    public get attacks(): Attack[] {
        return [...this.monsterAttacks];
    }

    public get baseAttack(): number {
        return this.monsterDetails.baseAttack;
    }

    public get level(): number {
        return this.monsterDetails.currentLevel;
    }

    public takeDamage(damage: number, callback: () => void) {
        // update current monster health and animate health bar
        this.currentHealth -= damage;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        this.healthBar.setMeterPercentageAnimated(
            this.currentHealth / this.maxHealth,
            { callback }
        );
    }

    public playMonsterAppearAnimation(_callback: () => void): void {
        throw new Error("playerMonsterAppearAnimation is not implemented.");
    }

    public playMonsterHealthBarAppearAnimation(_callback: () => void): void {
        throw new Error(
            "playerMonsterHealthBarAppearAnimation is not implemented."
        );
    }

    public playTakeDamageAnimation(callback: () => void) {
        if (this.skipBattleAnimations) {
            this.phaserGameObject.setAlpha(1);
            callback();
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 150,
            targets: this.phaserGameObject,
            alpha: {
                from: 1,
                start: 1,
                to: 0,
            },
            repeat: 5,
            onComplete: () => {
                this.phaserGameObject.setAlpha(1);
                if (callback) {
                    callback();
                }
            },
        });
    }

    public playDeathAnimation(_callback: () => void): void {
        throw new Error("playerDeathAnimation is not implemented.");
    }

    private createHealthBarComponents(
        scaleHealthBarBackgroundImageByY = 1
    ): void {
        this.healthBar = new HealthBar(this.scene, 34, 34);
        const monsterNameGameText = this.scene.add.text(30, 20, this.name, {
            fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
            color: "#7E3D3F",
            fontSize: "32px",
        });

        const healthBarBackgroundImage = this.scene.add
            .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
            .setOrigin(0)
            .setScale(1, scaleHealthBarBackgroundImageByY);

        const monsterHealthBarLevelText = this.scene.add.text(
            monsterNameGameText.width + 35,
            23,
            `L${this.level}`,
            {
                fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
                color: "#ED474B",
                fontSize: "28px",
            }
        );
        const monsterHpText = this.scene.add.text(30, 55, "HP", {
            fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
            color: "#FF6505",
            fontSize: "24px",
            fontStyle: "italic",
        });

        this.phaserHealthBarGameContainer = this.scene.add
            .container(0, 0, [
                healthBarBackgroundImage,
                monsterNameGameText,
                this.healthBar.container,
                monsterHealthBarLevelText,
                monsterHpText,
            ])
            .setAlpha(0);
    }
}
