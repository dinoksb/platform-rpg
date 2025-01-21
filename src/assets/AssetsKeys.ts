export const BATTLE_BACKGROUND_ASSET_KEYS = {
    FOREST: "FOREST",
} as const;

export const MONSTER_ASSET_KEYS = {
    IGUANIGNITE: "IGUANIGNITE",
    CARNODUSK: "CARNODUSK",
} as const;

export const BATTLE_ASSET_KEYS = {
    HEALTH_BAR_BACKGROUND: "HEALTH_BAR_BACKGROUND",
} as const;

export const HEALTH_BAR_ASSET_KEYS = {
    LEFT_CAP: "LEFT_CAP",
    RIGHT_CAP: "RIGHT_CAP",
    MIDDLE: "MIDDLE",
    LEFT_CAP_SHADOW: "LEFT_CAP_SHADOW",
    RIGHT_CAP_SHADOW: "RIGHT_CAP_SHADOW",
    MIDDLE_SHADOW: "MIDDLE_SHADOW",
} as const;

export const UI_ASSET_KEYS = {
    CURSOR: "CURSOR",
} as const;

export const DATA_ASSET_KEYS = {
    ATTACKS: "ATTACKS",
} as const;

export type BattleBackgroundAssetKey =
    (typeof BATTLE_BACKGROUND_ASSET_KEYS)[keyof typeof BATTLE_BACKGROUND_ASSET_KEYS];
export type MonsterAssetKey =
    (typeof MONSTER_ASSET_KEYS)[keyof typeof MONSTER_ASSET_KEYS];
export type BattleAssetKey =
    (typeof BATTLE_ASSET_KEYS)[keyof typeof BATTLE_ASSET_KEYS];
export type HealthBarAssetKey =
    (typeof HEALTH_BAR_ASSET_KEYS)[keyof typeof HEALTH_BAR_ASSET_KEYS];
export type UIAssetKey = (typeof UI_ASSET_KEYS)[keyof typeof UI_ASSET_KEYS];
export type DataAssetKey =
    (typeof DATA_ASSET_KEYS)[keyof typeof DATA_ASSET_KEYS];

export type AssetKey =
    | BattleBackgroundAssetKey
    | MonsterAssetKey
    | BattleAssetKey
    | HealthBarAssetKey
    | UIAssetKey
    | DataAssetKey;
