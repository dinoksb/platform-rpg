export const BATTLE_MENU_OPTIONS = {
    FIGHT: "FIGHT",
    SWITCH: "SIWTCH",
    ITEM: "ITEM",
    FLEE: "FLEE",
} as const;
export type BattleMenuOptions =
    (typeof BATTLE_MENU_OPTIONS)[keyof typeof BATTLE_MENU_OPTIONS];

export const ATTACK_MOVE_OPTIONS = {
    MOVE_1: "MOVE_1",
    MOVE_2: "MOVE_2",
    MOVE_3: "MOVE_3",
    MOVE_4: "MOVE_4",
} as const;
export type AttackMoveOptions =
    (typeof ATTACK_MOVE_OPTIONS)[keyof typeof ATTACK_MOVE_OPTIONS];

export const ACTIVE_BATTLE_MENU = {
    BATTLE_MAIN: "BATTLE_MAIN",
    BATTLE_MOVE_SELECT: "BATTLE_MOVE_SELECT",
    BATTLE_ITEM: "BATTLE_ITEM",
    BATTLE_SWITCH: "BATTLE_SWITCH",
    BATTLE_FLEE: "BATTLE_FLEE",
} as const;
export type ActiveBattleMenu =
    (typeof ACTIVE_BATTLE_MENU)[keyof typeof ACTIVE_BATTLE_MENU];
