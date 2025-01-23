import { DATA_ASSET_KEYS } from "../assets/AssetsKeys";
import { Attack, Animation } from "../game/interfaces/MonsterTypeDef";

export class DataUtils {
    public static getMonsterAttack(
        scene: Phaser.Scene,
        attackId: string
    ): Attack | undefined {
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS) as Attack[];
        return data.find((attack) => attack.id === Number(attackId));
    }

    public static getAnimations(
        scene: Phaser.Scene,
        assetKey: string
    ): Animation[] {
        const data = scene.cache.json.get(assetKey);
        return data;
    }
}
