import { AttackKeys } from "../battle/attacks/AttackKeys";

export interface BattleMonsterConfig {
    scene: Phaser.Scene;
    monsterDetails: Monster;
    scaleHealthBarBackgroundImageByY?: number;
    skipBattleAnimation: boolean;
}

export interface Monster {
    id: number;
    monsterId: number;
    name: string;
    assetKey: string;
    assetFrame: number;
    currentLevel: number;
    maxHp: number;
    currentHp: number;
    baseAttack: number;
    attackIds: number[];
}

export interface Attack {
    id: number;
    name: string;
    animationName: AttackKeys;
}

export interface Animation {
    key: string;
    frames: number[];
    frameRate: number;
    repeat: number;
    delay: number;
    yoyo: boolean;
    assetKey: string;   
}

export const ITEM_EFFECT = {
    HEAL_30: "HEAL_30",
} as const;
export type ItemEffect = (typeof ITEM_EFFECT)[keyof typeof ITEM_EFFECT];

export interface Item {
    id: number;
    name: string;
    effect: string;
    description: string;
}

export interface BaseInventoryItem {
    item: {
        id: number,
    };
    quantity: number;
}

export type Inventory = BaseInventoryItem[];

export interface InventoryItem {
    item: Item
    quantity: number;
}