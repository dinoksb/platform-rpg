import { DATA_ASSET_KEYS } from "../assets/AssetKeys";
import {
    Attack,
    Animation,
    Item,
    Monster,
    NpcDetails,
    NpcData,
} from "../game/interfaces/TypeDef";

export class DataUtils {
    public static getMonsterAttack(
        scene: Phaser.Scene,
        attackId: number
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

    public static getItem(scene: Phaser.Scene, itemId: number): Item {
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);
        return data.find((item: Item) => item.id == itemId);
    }

    public static getItems(scene: Phaser.Scene, itemIds: number[]): Item[] {
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);
        return data.filter((item: Item) => {
            return itemIds.some((id: number) => id === item.id);
        });
    }

    public static getMonsterById(
        scene: Phaser.Scene,
        monsterId: number
    ): Monster {
        const data = scene.cache.json.get(DATA_ASSET_KEYS.MONSTERS);
        return data.find((monster: Monster) => monster.id == monsterId);
    }

    public static getEncounterAreaDetails(
        scene: Phaser.Scene,
        areaId: number
    ): number[][] {
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ENCOUNTERS);
        return data[areaId];
    }

    public static getNpcData(scene: Phaser.Scene, npcId: number): NpcDetails {
        const data: NpcData = scene.cache.json.get(DATA_ASSET_KEYS.NPCS);
        return data[npcId];
    }
}
