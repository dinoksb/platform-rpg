import { BattleMonsterConfig } from "../../interfaces/Monster";
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

    private addHealthBarComponents() {
        this.healthBarTextGameObject = this.scene.add
            .text(443, 80, "25/25", {
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
