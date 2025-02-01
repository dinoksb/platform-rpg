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
    attackIds: string[];
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
