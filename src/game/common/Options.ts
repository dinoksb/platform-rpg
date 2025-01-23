export const BATTLE_SCENE_OPTIONS = {
    ON: "ON",
    OFF: "OFF",
} as const;

export type BattleSceneOptions =
    (typeof BATTLE_SCENE_OPTIONS)[keyof typeof BATTLE_SCENE_OPTIONS];
