import { BATTLE_ASSET_KEYS } from "../../../assets/AssetsKeys";
import { Attack, BattleMonsterConfig, Monster } from "../../interfaces/Monster";
import { HealthBar } from "../ui/HealthBar";
import { DataUtils } from "../../../utils/DataUtils";
import { Coordinate } from "../../interfaces/Coordinate";

export class BattleMonster {
    protected scene: Phaser.Scene;
    protected monsterDetails: Monster;
    protected phaserGameObject: Phaser.GameObjects.Image;
    protected healthBar: HealthBar;
    protected currentHealth: number;
    protected maxHealth: number;
    protected monsterAttacks: Attack[];
    protected phaserHealthBarGameContainer: Phaser.GameObjects.Container;

    constructor(config: BattleMonsterConfig, position: Coordinate) {
        this.scene = config.scene;
        this.monsterDetails = config.monsterDetails;
        this.currentHealth = this.monsterDetails.currentHp;
        this.maxHealth = this.monsterDetails.maxHp;
        this.monsterAttacks = [];

        this.phaserGameObject = this.scene.add.image(
            position.x,
            position.y,
            this.monsterDetails.assetKey,
            this.monsterDetails.assetFrame || 0
        );

        let scaleY = 1.0;
        if (config.scaleHealthBarBackgroundImageByY !== undefined) {
            scaleY = config.scaleHealthBarBackgroundImageByY;
        }
        this.createHealthBarComponents(scaleY);

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

    private createHealthBarComponents(scaleHealthBarBackgroundImageByY = 1) {
        this.healthBar = new HealthBar(this.scene, 34, 34);
        const monsterNameGameText = this.scene.add.text(30, 20, this.name, {
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
                color: "#ED474B",
                fontSize: "28px",
            }
        );
        const monsterHpText = this.scene.add.text(30, 55, "HP", {
            color: "#FF6505",
            fontSize: "24px",
            fontStyle: "italic",
        });

        this.phaserHealthBarGameContainer = this.scene.add.container(0, 0, [
            healthBarBackgroundImage,
            monsterNameGameText,
            this.healthBar.container,
            monsterHealthBarLevelText,
            monsterHpText,
        ]);
    }
}
