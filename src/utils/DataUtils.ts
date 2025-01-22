import { DATA_ASSET_KEYS } from "../assets/AssetsKeys";
import { Attack } from "../game/interfaces/MonsterTypeDef";

export class DataUtils {
    static getMonsterAttack(scene: Phaser.Scene, attackId: string) {
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS) as Attack[];
        return data.find((attack) => attack.id === Number(attackId));
    }
}
