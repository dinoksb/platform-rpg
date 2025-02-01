import { Game as MainGame } from "./scenes/Game";
import { Game, Types } from "phaser";
import { PreloadScene } from "./scenes/PreloadScene";
import { BattleScene } from "./scenes/BattleScene";
import { WorldScene } from "./scenes/WorldScene";
import { TitleScene } from "./scenes/TitleScene";
import { MonsterPartyScene } from "./scenes/MonsterPartyScene";
import { MonsterDatailsScene } from "./scenes/MonsterDetailsScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.CANVAS,
    pixelArt: false,
    scale: {
        parent: "game-container",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1024,
        height: 576,
    },
    backgroundColor: "#000000",
    scene: [PreloadScene, TitleScene, WorldScene, BattleScene, MainGame, MonsterPartyScene, MonsterDatailsScene],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
