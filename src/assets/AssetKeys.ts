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
    CURSOR_WHITE: "CURSOR_WHITE",
    MENU_BACKGROUND: "MENU_BACKGROUND",
    MENU_BACKGROUND_GREEN: "MENU_BACKGROUND_GREEN",
    MENU_BACKGROUND_PURPLE: "MENU_BACKGROUND_PURPLE",
    BLUE_BUTTON: "BLUE_BUTTON",
    BLUE_BUTTON_SELECTED: "BLUE_BUTTON_SELECTED",
} as const;

export const DATA_ASSET_KEYS = {
    ATTACKS: "ATTACKS",
    ITEMS: "ITEMS",
    PLAYER_ANIMATIONS: "PLAYER_ANIMATIONS",
    ICESHARD_ANIMATIONS: "ICESHARD_ANIMATIONS",
    SLASH_ANIMATIONS: "SLASH_ANIMATIONS",
    NPC_ANIMATIONS: "NPC_ANIMATIONS",
} as const;

export const ATTACK_ASSET_KEYS = {
    ICE_SHARD: "ICE_SHARD",
    ICE_SHARD_START: "ICE_SHARD_START",
    SLASH: "SLASH",
} as const;

export const WORLD_ASSET_KEYS = {
    WORLD_BACKGROUND: "WORLD_BACKGROUND",
    WORLD_FOREGROUND: "WORLD_FOREGROUND",
    WORLD_MAIN_LEVEL: "WORLD_MAIN_LEVEL",
    WORLD_COLLISION: "WORLD_COLLISION",
    WORLD_BOULDER_COLLISION: "WORLD_BOULDER_COLLISION",
    WORLD_ENCOUNTER_ZONE: "WORLD_ENCOUNTER_ZONE",
} as const;

export const CHARACTER_ASSET_KEYS = {
    PLAYER: "PLAYER",
    NPC: "NPC",
} as const;

export const TITLE_ASSET_KEYS = {
    BACKGROUND: "BACKGROUND",
    TITLE: "TITLE",
    PANEL: "PANEL",
} as const;

export const MONSTER_PARTY_ASSET_KEYS = {
    PARTY_BACKGROUND: "PARTY_BACKGROUND",
    MONSTER_DETAILS_BACKGROUND: "MONSTER_DETAILS_BACKGROUND",
} as const;

export const INVENTORY_ASSET_KEYS = {
    INVENTORY_BACKGROUND: "INVENTORY_BACKGROUND",
    INVENTORY_BAG: "INVENTORY_BAG",
} as const;

// export type BattleBackgroundAssetKey =
//     (typeof BATTLE_BACKGROUND_ASSET_KEYS)[keyof typeof BATTLE_BACKGROUND_ASSET_KEYS];
// export type MonsterAssetKey =
//     (typeof MONSTER_ASSET_KEYS)[keyof typeof MONSTER_ASSET_KEYS];
// export type BattleAssetKey =
//     (typeof BATTLE_ASSET_KEYS)[keyof typeof BATTLE_ASSET_KEYS];
// export type HealthBarAssetKey =
//     (typeof HEALTH_BAR_ASSET_KEYS)[keyof typeof HEALTH_BAR_ASSET_KEYS];
// export type UIAssetKey = (typeof UI_ASSET_KEYS)[keyof typeof UI_ASSET_KEYS];
// export type DataAssetKey =
//     (typeof DATA_ASSET_KEYS)[keyof typeof DATA_ASSET_KEYS];
// export type AttackAssetKey =
//     (typeof ATTACK_ASSET_KEYS)[keyof typeof ATTACK_ASSET_KEYS];
// export type WorldAssetKey =
//     (typeof WORLD_ASSET_KEYS)[keyof typeof WORLD_ASSET_KEYS];
// export type CharactgerAssetKey =
//     (typeof CHARACTER_ASSET_KEYS)[keyof typeof CHARACTER_ASSET_KEYS];
// export type TitleAssetKey =
//     (typeof TITLE_ASSET_KEYS)[keyof typeof TITLE_ASSET_KEYS];
// export type MonsterPartyAssetKey =
//     (typeof MONSTER_PARTY_ASSET_KEYS)[keyof typeof MONSTER_PARTY_ASSET_KEYS];
// export type InventoryAssetKey =
//     (typeof INVENTORY_ASSET_KEYS)[keyof typeof INVENTORY_ASSET_KEYS];

// export type AssetKey =
//     | BattleBackgroundAssetKey
//     | MonsterAssetKey
//     | BattleAssetKey
//     | HealthBarAssetKey
//     | UIAssetKey
//     | DataAssetKey
//     | AttackAssetKey
//     | WorldAssetKey
//     | CharactgerAssetKey
//     | TitleAssetKey
//     | MonsterPartyAssetKey
//     | InventoryAssetKey;
