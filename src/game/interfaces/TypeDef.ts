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
        id: number;
    };
    quantity: number;
}

export type Inventory = BaseInventoryItem[];

export interface InventoryItem {
    item: Item;
    quantity: number;
}

export type EncounterData = Record<string, number[][]>;

/** NPC JSON Data Types */

export const NPC_EVENT_TYPE = {
    MESSAGE: "MESSAGE",
    SCENE_FADE_IN_AND_OUT: "SCENE_FADE_IN_AND_OUT",
    SCENE_CHANGE: "SCENE_CHANGE",
    HEAL: "HEAL",
    TRADE: "TRADE",
    ITEM: "ITEM",
    BATTLE: "BATTLE",
} as const;

export type NpcEventType = keyof typeof NPC_EVENT_TYPE;

export interface NpcEventMessage {
    type: typeof NPC_EVENT_TYPE.MESSAGE;
    requires: string[];
    data: {
        messages: string[];
    };
}

export interface NpcEventSceneFadeInAndOut {
    type: typeof NPC_EVENT_TYPE.SCENE_FADE_IN_AND_OUT;
    requires: string[];
    data: {
        fadeInDuration: number;
        fadeOutDuration: number;
        waitDuration: number;
    };
}

export interface NpcEventSceneChange {
    type: typeof NPC_EVENT_TYPE.SCENE_CHANGE;
    requires: string[];
    data: {
        sceneName: string;
        fadeOutDuration: number;
    };
}

export interface NpcEventHeal {
    type: typeof NPC_EVENT_TYPE.HEAL;
    requires: string[];
    data: {};
}

export type NpcEvent =
    | NpcEventMessage
    | NpcEventSceneFadeInAndOut
    | NpcEventHeal
    | NpcEventSceneChange;

export interface NpcDetails {
    frame: number;
    animationKeyPrefix: string;
    events: NpcEvent[];
}

export type NpcData = Record<string, NpcDetails>;
