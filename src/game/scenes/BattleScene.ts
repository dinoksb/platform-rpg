import { Scene } from "phaser";
import { SCENE_KEYS } from "./SceneKeys";
import { BattleMenu } from "../battle/ui/menu/BattleMenu";
import { Background } from "../battle/Background";
import { EnemyBattleMonster } from "../battle/monsters/EnemyBattleMonster";
import { PlayerBattleMonster } from "../battle/monsters/PlayerBattleMonster";
import { MONSTER_ASSET_KEYS } from "../../assets/AssetsKeys";
import { StateMachine } from "../../utils/StateMachine";
import { BATTLE_STATES } from "../battle/states/BattleStates";
import { ATTACK_TARGET, AttackManager } from "../battle/attacks/AttackManager";
import { createSceneTransition } from "../../utils/SceneTransition";
import { Controls } from "../../utils/Controls";
import { DIRECTION } from "../common/Direction";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { BATTLE_SCENE_OPTIONS } from "../common/Options";

export class BattleScene extends Scene {
    private battleMenu: BattleMenu;
    private controls: Controls;
    private activePlayerMonster: PlayerBattleMonster;
    private activeEnemyMonster: EnemyBattleMonster;
    private activePlayerAttackIndex: number;
    private battleStateMachine: StateMachine;
    private attackManager: AttackManager;
    private skipAnimations: boolean;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
    }

    init() {
        this.activePlayerAttackIndex = -1;
        this.skipAnimations = true;
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

    create() {
        console.log(`[${BattleScene.name}:create] invoked`);
        // create main background
        const background = new Background(this);
        background.showForest();

        // render out the player and enemy monsters
        this.activeEnemyMonster = new EnemyBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.CARNODUSK,
                assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: ["1"],
                baseAttack: 5,
                currentLevel: 5,
            },
            skipBattleAnimation: this.skipAnimations,
        });

        this.activePlayerMonster = new PlayerBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: ["2"],
                baseAttack: 15,
                currentLevel: 5,
            },
            skipBattleAnimation: this.skipAnimations,
        });

        // render out the main info and sub info panles
        this.battleMenu = new BattleMenu(this, this.activePlayerMonster);
        this.createBattleStateMachine();
        this.attackManager = new AttackManager(this, this.skipAnimations);

        this.controls = new Controls(this);
    }

    update() {
        this.battleStateMachine.update();

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

    private playerAttack() {
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
                                            this.enemyAttack();
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

    private enemyAttack() {
        if (this.activeEnemyMonster.isFainted) {
            this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            return;
        }

        this.battleMenu.updateInfoPanelMesssageNoInputRequired(
            `for ${this.activeEnemyMonster.name} used ${
                this.activeEnemyMonster.attacks[this.activePlayerAttackIndex]
                    .name
            }.`,
            () => {
                this.time.delayedCall(500, () => {
                    this.attackManager.playAttackAnimation(
                        this.activeEnemyMonster.attacks[0].animationName,
                        ATTACK_TARGET.PLAYER,
                        () => {
                            this.activePlayerMonster.playTakeDamageAnimation(
                                () => {
                                    this.activePlayerMonster.takeDamage(
                                        this.activeEnemyMonster.baseAttack,
                                        () => {
                                            this.postBattleSequenceCheck();
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
        if (this.activeEnemyMonster.isFainted) {
            this.activeEnemyMonster.playTakeDamageAnimation(() => {
                this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                    [
                        `Wild ${this.activeEnemyMonster.name} fainted.`,
                        "You have gained some experience.",
                    ],
                    () => {
                        this.battleStateMachine.setState(
                            BATTLE_STATES.FINISHED
                        );
                    },
                    this.skipAnimations
                );
            });
            return;
        }

        if (this.activePlayerMonster.isFainted) {
            this.activeEnemyMonster.playDeathAnimation(() => {
                this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                    [
                        `${this.activePlayerMonster.name} fainted.`,
                        "You have no more monsters, escaping to safety...",
                    ],
                    () => {
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
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
                this.scene.start(SCENE_KEYS.WORLD_SCENE);
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

                this.playerAttack();
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
                this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                    [`You got away safely!`],
                    () => {
                        this.battleStateMachine.setState(
                            BATTLE_STATES.FINISHED
                        );
                    },
                    this.skipAnimations
                );
            },
        });

        // start the state machine
        this.battleStateMachine.setState("INTRO");
    }
}
