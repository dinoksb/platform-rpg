import Phaser from "phaser";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../../../assets/FontKeys";

export const BATTLE_UI_TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "black",
    fontSize: "30px",
} as const;

export type BattleUITextStyle =
    (typeof Phaser.GameObjects.TextStyle)[keyof typeof Phaser.GameObjects.TextStyle];
