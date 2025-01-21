import Phaser from "phaser";

export const BATTLE_UI_TEXT_STYLE = {
    color: "black",
    fontSize: "30px",
} as const;

export type BattleUITextStyle =
    (typeof Phaser.GameObjects.TextStyle)[keyof typeof Phaser.GameObjects.TextStyle];
