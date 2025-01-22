import { exhaustiveGuard } from "../../../utils/Guard";
import { ATTACK_KEYS, AttackKeys } from "./AttackKeys";
import { IceShard } from "./Ice-Shard";
import { Slash } from "./Slash";

export const ATTACK_TARGET = {
    PLAYER: 'PLAYER',
    ENEMY: 'ENEMY',
} as const;

export type AttackTarget = (typeof ATTACK_TARGET)[keyof typeof ATTACK_TARGET];


export class AttackManager {
    private scene: Phaser.Scene;
    private skipBattleAnimation: boolean;
    private iceShardAttack: IceShard;
    private slashAttack: Slash;

    constructor(scene: Phaser.Scene, skipBattleAnimations: boolean) {
        this.scene = scene;
        this.skipBattleAnimation = skipBattleAnimations;
    }

    public playAttackAnimation(
        attack: AttackKeys,
        target: AttackTarget,
        callback: () => void
    ): void {
        if (this.skipBattleAnimation) {
            if (callback) {
                callback();
            }
            return;
        }

        // if attack targetr is enemy
        let x = 745;
        let y = 140;
        if (target === ATTACK_TARGET.PLAYER) {
            x = 256;
            y = 344;
        }

        switch (attack) {
            case ATTACK_KEYS.ICE_SHARD:
                if (!this.iceShardAttack) {
                    this.iceShardAttack = new IceShard(this.scene, { x, y });
                }
                if (this.iceShardAttack && this.iceShardAttack.gameObject) {
                    this.iceShardAttack.gameObject.setPosition(x, y);
                    this.iceShardAttack.playAnimation(callback);
                }
                break;
            case ATTACK_KEYS.SLASH:
                if (!this.slashAttack) {
                    this.slashAttack = new Slash(this.scene, { x, y });
                }
                if (this.slashAttack && this.slashAttack.gameObject) {
                    this.slashAttack.gameObject.setPosition(x, y);
                    this.slashAttack.playAnimation(callback);
                }
                break;
            default:
                exhaustiveGuard(attack);
        }
    }
}
