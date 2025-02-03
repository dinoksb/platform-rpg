import { PreloadScene } from "./scenes/PreloadScene";
import { BattleScene } from "./scenes/BattleScene";
import { WorldScene } from "./scenes/WorldScene";
import { TitleScene } from "./scenes/TitleScene";
import { MonsterPartyScene } from "./scenes/MonsterPartyScene";
import { MonsterDatailsScene } from "./scenes/MonsterDetailsScene";
import { InventoryScene } from "./scenes/InventoryScene";
import { EndingScene } from "./scenes/EndingScene";
import { Types } from "phaser";

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
    scene: [PreloadScene, TitleScene, WorldScene, BattleScene, MonsterPartyScene, MonsterDatailsScene, InventoryScene, EndingScene],
};

const StartGame = (parent: string) => {
    return new Phaser.Game({...config, parent});
};

export default StartGame;
