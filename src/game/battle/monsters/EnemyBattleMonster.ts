import { BattleMonsterConfig } from "../../interfaces/Monster";
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
}
