import { SCENE_KEYS } from "./SceneKeys";
import { BattleMenu } from "../battle/ui/menu/BattleMenu";
import { Background } from "../battle/Background";
import { EnemyBattleMonster } from "../battle/monsters/EnemyBattleMonster";
import { PlayerBattleMonster } from "../battle/monsters/PlayerBattleMonster";
import { StateMachine } from "../../utils/StateMachine";
import { BATTLE_STATES } from "../battle/states/BattleStates";
import { ATTACK_TARGET, AttackManager } from "../battle/attacks/AttackManager";
import { createSceneTransition } from "../../utils/SceneTransition";
import { DIRECTION } from "../common/Direction";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { BATTLE_SCENE_OPTIONS } from "../common/Options";
import { BaseScene } from "./BaseScene";
import { Monster } from "../interfaces/TypeDef";
import { DataUtils } from "../../utils/DataUtils";
import { WorldSceneData } from "./WorldScene";
import {
    calculateExpGainedFromMonster,
    handleMonsterGainingExperience,
    StatChanges,
} from "../../utils/LevelingUtils";

export interface BattleSceneData {
    playerMonsters: Monster[];
    enemyMonsters: Monster[];
}

export class BattleScene extends BaseScene {
    private battleMenu: BattleMenu;
    private activePlayerMonster: PlayerBattleMonster;
    private activeEnemyMonster: EnemyBattleMonster;
    private activePlayerAttackIndex: number;
    private battleStateMachine: StateMachine;
    private attackManager: AttackManager;
    private skipAnimations: boolean;
    private activeEnemyAttackIndex: number;
    private sceneData: BattleSceneData;
    private activePlayerMonsterPartyIndex: number;
    private playerKnockedOut: boolean;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
    }

    init(data: BattleSceneData): void {
        super.init(data);

        this.sceneData = data;

        if (Object.keys(data).length === 0) {
            this.sceneData = {
                enemyMonsters: [DataUtils.getMonsterById(this, 2)],
                playerMonsters: [
                    dataManager.getStore.get(
                        DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
                    )[0],
                ],
            };
        }

        this.activePlayerAttackIndex = -1;
        this.activeEnemyAttackIndex = -1;
        this.activePlayerMonsterPartyIndex = 0;
        this.skipAnimations = true;
        this.playerKnockedOut = false;
        const chosenBattleSceneOption = dataManager.getStore.get(
            DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS
        );
        if (
            chosenBattleSceneOption === undefined ||
            chosenBattleSceneOption === BATTLE_SCENE_OPTIONS.ON
        ) {
            this.skipAnimations = false;
        }
    }

    create(): void {
        super.create();

        // create main background
        const background = new Background(this);
        background.showForest();

        // render out the player and enemy monsters
        this.activeEnemyMonster = new EnemyBattleMonster({
            scene: this,
            // monsterDetails: DataUtils.getMonsterById(this, 2),
            monsterDetails: this.sceneData.enemyMonsters[0],
            skipBattleAnimation: this.skipAnimations,
        });

        this.activePlayerMonster = new PlayerBattleMonster({
            scene: this,
            // monsterDetails: dataManager.getStore.get(
            //     DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
            // )[0],
            monsterDetails: this.sceneData.playerMonsters[0],
            skipBattleAnimation: this.skipAnimations,
        });

        // render out the main info and sub info panles
        this.battleMenu = new BattleMenu(this, this.activePlayerMonster);
        this.createBattleStateMachine();
        this.attackManager = new AttackManager(this, this.skipAnimations);

        this.controls.lockInput = true;
    }

    update(): void {
        super.update();

        this.battleStateMachine.update();

        if (this.controls.isInputLocked) {
            return;
        }

        const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
        // limit input based on the current battle state we are in
        // if we are not in the right battle state, return early and do not process input
        if (
            wasSpaceKeyPressed &&
            (this.battleStateMachine.currentStateName ===
                BATTLE_STATES.PRE_BATTLE_INFO ||
                this.battleStateMachine.currentStateName ===
                    BATTLE_STATES.POST_ATTACK_CHECK ||
                this.battleStateMachine.currentStateName ===
                    BATTLE_STATES.GAIN_EXPERIENCE ||
                this.battleStateMachine.currentStateName ===
                    BATTLE_STATES.FLEE_ATTEMPT)
        ) {
            this.battleMenu.handlePlayerInput("OK");
            return;
        }

        if (
            this.battleStateMachine.currentStateName !==
            BATTLE_STATES.PLAYER_INPUT
        ) {
            return;
        }

        if (wasSpaceKeyPressed) {
            this.battleMenu.handlePlayerInput("OK");

            // check if the player used an item
            if (this.battleMenu.wasItemUsed) {
                this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
                return;
            }

            // check if the player attempted to flee
            if (this.battleMenu.isAttempingToFlee) {
                this.battleStateMachine.setState(BATTLE_STATES.FLEE_ATTEMPT);
                return;
            }

            // check if the player selected an attack, and update display text
            if (this.battleMenu.selectedAttack === undefined) {
                return;
            }

            this.activePlayerAttackIndex = this.battleMenu.selectedAttack;
            if (
                !this.activePlayerMonster.attacks[this.activePlayerAttackIndex]
            ) {
                return;
            }

            console.log(
                `Player selected the following move: ${this.battleMenu.selectedAttack}`
            );

            this.battleMenu.hideMonsterAttackSubMenu();
            this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
            return;
        }

        if (this.controls.wasBackKeyPressed()) {
            this.battleMenu.handlePlayerInput("CANCEL");
            return;
        }

        const selectedDirection = this.controls.getDirectionKeyJustPressed();
        if (selectedDirection !== DIRECTION.NONE) {
            this.battleMenu.handlePlayerInput(selectedDirection);
        }
    }

    private playerAttack(callback: () => void): void {
        if (this.activePlayerMonster.isFainted) {
            callback();
            return;
        }

        this.battleMenu.updateInfoPanelMesssageNoInputRequired(
            `${this.activePlayerMonster.name} used ${this.activePlayerMonster.attacks[0].name}.`,
            () => {
                this.time.delayedCall(500, () => {
                    this.attackManager.playAttackAnimation(
                        this.activePlayerMonster.attacks[
                            this.activePlayerAttackIndex
                        ].animationName,
                        ATTACK_TARGET.ENEMY,
                        () => {
                            this.activeEnemyMonster.playTakeDamageAnimation(
                                () => {
                                    this.activeEnemyMonster.takeDamage(
                                        this.activePlayerMonster.baseAttack,
                                        () => {
                                            callback();
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            },
            this.skipAnimations
        );
    }

    private enemyAttack(callback: () => void): void {
        if (this.activeEnemyMonster.isFainted) {
            callback();
            return;
        }

        this.battleMenu.updateInfoPanelMesssageNoInputRequired(
            `for ${this.activeEnemyMonster.name} used ${
                this.activeEnemyMonster.attacks[this.activeEnemyAttackIndex]
                    .name
            }.`,
            () => {
                this.time.delayedCall(500, () => {
                    this.attackManager.playAttackAnimation(
                        this.activeEnemyMonster.attacks[
                            this.activeEnemyAttackIndex
                        ].animationName,
                        ATTACK_TARGET.PLAYER,
                        () => {
                            this.activePlayerMonster.playTakeDamageAnimation(
                                () => {
                                    this.activePlayerMonster.takeDamage(
                                        this.activeEnemyMonster.baseAttack,
                                        () => {
                                            callback();
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            },
            this.skipAnimations
        );
    }

    private postBattleSequenceCheck() {

        this.sceneData.playerMonsters[
            this.activePlayerMonsterPartyIndex
        ].currentHp = this.activePlayerMonster.getCurrentHp;
        dataManager.getStore.set(
            DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY,
            this.sceneData.playerMonsters
        );
        if (this.activeEnemyMonster.isFainted) {
            this.controls.lockInput = true;
            this.activeEnemyMonster.playDeathAnimation(() => {
                this.controls.lockInput = false;
                this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                    [`Wild ${this.activeEnemyMonster.name} fainted.`],
                    () => {
                        this.battleStateMachine.setState(
                            BATTLE_STATES.GAIN_EXPERIENCE
                        );
                    },
                    this.skipAnimations
                );
            });

            const battleCount = dataManager.getStore.get(
                DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_COUNT
            );
            dataManager.getStore.set(
                DATA_MANAGER_STORE_KEYS.BATTLE_OPTIONS_BATTLE_COUNT,
                battleCount + 1
            );
            return;
        }

        if (this.activePlayerMonster.isFainted) {
            this.controls.lockInput = true;
            this.activePlayerMonster.playDeathAnimation(() => {
                this.controls.lockInput = false;
                this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                    [
                        `${this.activePlayerMonster.name} fainted.`,
                        "You have no more monsters, escaping to safety...",
                    ],
                    () => {
                        this.playerKnockedOut = true;
                        this.battleStateMachine.setState(
                            BATTLE_STATES.FINISHED
                        );
                    },
                    this.skipAnimations
                );
            });
            return;
        }

        this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
    }

    private transitionToNextScene() {
        const sceneDataToPass: WorldSceneData = {
            isPlayerKnockedOut: this.playerKnockedOut,
        };
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
                this.scene.start(SCENE_KEYS.WORLD_SCENE, sceneDataToPass);
            }
        );
    }

    private createBattleStateMachine() {
        this.battleStateMachine = new StateMachine("battle", this);
        this.battleStateMachine.addState({
            name: BATTLE_STATES.INTRO,
            onEnter: () => {
                // wait for any scene setup and transitions to complete.
                createSceneTransition(this, {
                    skipSceneTransition: this.skipAnimations,
                    callback: () => {
                        this.battleStateMachine.setState(
                            BATTLE_STATES.PRE_BATTLE_INFO
                        );
                    },
                });
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.PRE_BATTLE_INFO,
            onEnter: () => {
                // wait  for enemy monster to appear on the screen and notify player about the wild monster.
                this.activeEnemyMonster.playMonsterAppearAnimation(() => {
                    this.activeEnemyMonster.playMonsterHealthBarAppearAnimation(
                        () => undefined
                    );
                    this.controls.lockInput = false;
                    this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                        [`wild ${this.activeEnemyMonster.name} appeared!`],
                        () => {
                            // wait for text animation to complete and move to next state
                            this.battleStateMachine.setState(
                                BATTLE_STATES.BRING_OUT_MONSTER
                            );
                        },
                        this.skipAnimations
                    );
                });
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.BRING_OUT_MONSTER,
            onEnter: () => {
                // wait for player monster to appear on the screen and notify  the player about monster
                this.activePlayerMonster.playMonsterAppearAnimation(() => {
                    this.activePlayerMonster.playMonsterHealthBarAppearAnimation(
                        () => undefined
                    );
                    this.battleMenu.updateInfoPanelMesssageNoInputRequired(
                        `go ${this.activePlayerMonster.name}!`,
                        () => {
                            // wait for text animation to complete and move to next state
                            this.time.delayedCall(500, () => {
                                this.battleStateMachine.setState(
                                    BATTLE_STATES.PLAYER_INPUT
                                );
                            });
                        },
                        this.skipAnimations
                    );
                });
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.PLAYER_INPUT,
            onEnter: () => {
                this.battleMenu.showMainBattleMenu();
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.ENEMY_INPUT,
            onEnter: () => {
                // TODO: add feature in a future update
                // pick a random move for the enemy monster, and in the future implement some type of AI behaviour

                this.activeEnemyAttackIndex =
                    this.activeEnemyMonster.pickRandomMove();
                this.battleStateMachine.setState(BATTLE_STATES.BATTLE);
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.BATTLE,
            onEnter: () => {
                // general battle flow
                // show attack used. brief pause,
                // then play attack animation, brief pause
                // then play damge animation, brief pause
                // then play health bar animation, brief pause
                // then reapeat the steps above for the other monster

                // if item was used, only have enemy attack
                if (this.battleMenu.wasItemUsed) {
                    this.activePlayerMonster.updateMonsterHealth(
                        dataManager.getStore.get(
                            DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
                        )[0].currentHp
                    );
                    this.time.delayedCall(500, () => {
                        this.enemyAttack(() => {
                            this.battleStateMachine.setState(
                                BATTLE_STATES.POST_ATTACK_CHECK
                            );
                        });
                    });
                    return;
                }

                if (this.battleMenu.isAttempingToFlee) {
                    this.time.delayedCall(500, () => {
                        this.enemyAttack(() => {
                            this.battleStateMachine.setState(
                                BATTLE_STATES.POST_ATTACK_CHECK
                            );
                        });
                    });
                    return;
                }

                const randomNumber = Phaser.Math.Between(0, 1);
                if (randomNumber === 0) {
                    this.playerAttack(() => {
                        this.enemyAttack(() => {
                            this.battleStateMachine.setState(
                                BATTLE_STATES.POST_ATTACK_CHECK
                            );
                        });
                    });
                    return;
                }
                this.enemyAttack(() => {
                    this.playerAttack(() => {
                        this.battleStateMachine.setState(
                            BATTLE_STATES.POST_ATTACK_CHECK
                        );
                    });
                });
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.POST_ATTACK_CHECK,
            onEnter: () => {
                this.postBattleSequenceCheck();
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.FINISHED,
            onEnter: () => {
                this.transitionToNextScene();
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.FLEE_ATTEMPT,
            onEnter: () => {
                const randomNumber = Phaser.Math.Between(1, 10);
                if (randomNumber > 5) {
                    // player has run away successfully
                    this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                        [`You got away safely!`],
                        () => {
                            this.battleStateMachine.setState(
                                BATTLE_STATES.FINISHED
                            );
                        },
                        this.skipAnimations
                    );
                    return;
                }

                // player failed to run away, allow enemy to take their turn.
                this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                    ["You failed to run away..."],
                    () => {
                        this.time.delayedCall(200, () => {
                            this.battleStateMachine.setState(
                                BATTLE_STATES.ENEMY_INPUT
                            );
                        });
                    },
                    this.skipAnimations
                );
            },
        });

        this.battleStateMachine.addState({
            name: BATTLE_STATES.GAIN_EXPERIENCE,
            onEnter: () => {
                const gainedExpForActiveMonster = calculateExpGainedFromMonster(
                    this.activeEnemyMonster.baseExpValue,
                    this.activeEnemyMonster.level,
                    true
                );
                const gainedExpForInActiveMonster =
                    calculateExpGainedFromMonster(
                        this.activeEnemyMonster.baseExpValue,
                        this.activeEnemyMonster.level,
                        false
                    );

                const messages: string[] = [];
                let didActiveMonsterLevelUp = false;
                this.sceneData.playerMonsters.forEach(
                    (monster: Monster, index: number) => {
                        if(this.sceneData.playerMonsters[index].currentHp <= 0){
                            return;
                        }

                        let statChanges: StatChanges | null;
                        const monsterMessages: string[] = [];
                        if (index === this.activePlayerMonsterPartyIndex) {
                            statChanges =
                                this.activePlayerMonster.updateMonsterExp(
                                    gainedExpForActiveMonster
                                );
                                monsterMessages.push(
                                `${this.sceneData.playerMonsters[index].name} gained ${gainedExpForActiveMonster} exp.`
                            );
                            if(statChanges.level !== 0){
                                didActiveMonsterLevelUp = true;
                            }
                        } else {
                            statChanges = handleMonsterGainingExperience(this.sceneData.playerMonsters[index], gainedExpForInActiveMonster);
                            monsterMessages.push(
                                `${this.sceneData.playerMonsters[index].name} gained ${gainedExpForActiveMonster} exp.`
                            );
                        }

                        if (statChanges?.level !== 0) {
                            monsterMessages.push(
                                `${this.sceneData.playerMonsters[index].name} level increase to ${this.sceneData.playerMonsters[index].currentLevel}!`,
                                `${this.sceneData.playerMonsters[index].name} attack increased by ${statChanges?.attack} \nand health increased by ${statChanges?.health}`
                            );
                        }

                        if(index ===  this.activePlayerMonsterPartyIndex){
                            messages.unshift(...monsterMessages);
                        } else{
                            messages.push(...monsterMessages);
                        }
                    }
                );

                this.controls.lockInput = true;
                this.activePlayerMonster.updateMonsterExpBar(() => {
                    this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                        messages,
                        () => {
                            this.time.delayedCall(200, () => {
                                //update dataManager with latest monster data
                                dataManager.getStore.set(
                                    DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY,
                                    this.sceneData.playerMonsters
                                );
                                this.battleStateMachine.setState(
                                    BATTLE_STATES.FINISHED
                                );
                            });
                        },
                        this.skipAnimations
                    );
                    this.controls.lockInput = false;
                }, didActiveMonsterLevelUp);
            },
        });

        // start the state machine
        this.battleStateMachine.setState("INTRO");
    }
}
