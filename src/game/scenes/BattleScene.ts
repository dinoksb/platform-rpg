import { Scene } from "phaser";
import { SCENE_KEYS } from "./SceneKeys";
import { BattleMenu } from "../battle/ui/menu/BattleMenu";
import { Direction, DIRECTION } from "../common/Direction";
import { Background } from "../battle/Background";
import { EnemyBattleMonster } from "../battle/monsters/EnemyBattleMonster";
import { PlayerBattleMonster } from "../battle/monsters/PlayerBattleMonster";
import { MONSTER_ASSET_KEYS } from "../../assets/AssetsKeys";
import { StateMachine } from "../../utils/StateMachine";
import { BATTLE_STATES } from "../battle/states/BattleStates";

export class BattleScene extends Scene {
    private battleMenu: BattleMenu;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private activePlayerMonster: PlayerBattleMonster;
    private activeEnemyMonster: EnemyBattleMonster;
    private activePlayerAttackIndex: number;
    private battleStateMachine: StateMachine;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
    }

    init() {
        this.activePlayerAttackIndex = -1;
    }

    create() {
        console.log(`[${BattleScene.name}:create] invoked`);
        // create main background
        const background = new Background(this);
        background.showForest();

        // render out the player and enemy monsters
        this.activePlayerMonster = new PlayerBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: ["2"],
                baseAttack: 5,
                currentLevel: 5,
            },
        });

        this.activeEnemyMonster = new EnemyBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.CARNODUSK,
                assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: ["1"],
                baseAttack: 25,
                currentLevel: 5,
            },
        });

        // render out the main info and sub info panles
        this.battleMenu = new BattleMenu(this, this.activePlayerMonster);
        this.createBattleStateMachine();

        this.cursorKeys = this.input.keyboard!.createCursorKeys();
    }

    update() {
        this.battleStateMachine.update();

        if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.space)) {
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

        if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.shift)) {
            this.battleMenu.handlePlayerInput("CANCEL");
            return;
        }

        let selectedDirection: Direction = DIRECTION.NONE;
        if (this.cursorKeys.left.isDown) {
            selectedDirection = DIRECTION.LEFT;
        } else if (this.cursorKeys.right.isDown) {
            selectedDirection = DIRECTION.RIGHT;
        } else if (this.cursorKeys.up.isDown) {
            selectedDirection = DIRECTION.UP;
        } else if (this.cursorKeys.down.isDown) {
            selectedDirection = DIRECTION.DOWN;
        }

        if (selectedDirection !== DIRECTION.NONE) {
            this.battleMenu.handlePlayerInput(selectedDirection);
        }
    }

    private playerAttack() {
        this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
            [
                `${this.activePlayerMonster.name} used ${this.activePlayerMonster.attacks[0].name}.`,
            ],
            () => {
                this.time.delayedCall(500, () => {
                    this.activeEnemyMonster.takeDamage(
                        this.activePlayerMonster.baseAttack,
                        () => {
                            this.enemyAttack();
                        }
                    );
                });
            }
        );
    }

    private enemyAttack() {
        if (this.activeEnemyMonster.isFainted) {
            this.postBattleSequenceCheck();
            this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            return;
        }

        this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
            [
                `for ${this.activeEnemyMonster.name} used ${
                    this.activeEnemyMonster.attacks[
                        this.activePlayerAttackIndex
                    ].name
                }.`,
            ],
            () => {
                this.time.delayedCall(500, () => {
                    this.activePlayerMonster.takeDamage(
                        this.activeEnemyMonster.baseAttack,
                        () => {
                            this.postBattleSequenceCheck();
                        }
                    );
                });
            }
        );
    }

    private postBattleSequenceCheck() {
        if (this.activeEnemyMonster.isFainted) {
            this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                [
                    `Wild ${this.activeEnemyMonster.name} fainted.`,
                    "You have gained some experience.",
                ],
                () => {
                    this.transitionToNextScene();
                }
            );
            return;
        }

        if (this.activePlayerMonster.isFainted) {
            this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                [
                    `${this.activePlayerMonster.name} fainted.`,
                    "You have no more monsters, escaping to safety...",
                ],
                () => {
                    this.transitionToNextScene();
                }
            );
            return;
        }

        this.battleMenu.showMainBattleMenu();
    }

    private transitionToNextScene() {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
                this.scene.start(SCENE_KEYS.BATTLE_SCENE);
            }
        );
    }

    private createBattleStateMachine() {
        this.battleStateMachine = new StateMachine("battle", this);
        this.battleStateMachine.addState({
            name: BATTLE_STATES.INTRO,
            onEnter: () => {
                // wait for any scene setup and transitions to complete.
                this.time.delayedCall(500, () => {
                    this.battleStateMachine.setState(
                        BATTLE_STATES.PRE_BATTLE_INFO
                    );
                });
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.PRE_BATTLE_INFO,
            onEnter: () => {
                // wait  for enemy monster to appear on the screen and notify player about the wild monster.
                this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                    [`wild ${this.activeEnemyMonster.name} appeared!`],
                    () => {
                        // wait for text animation to complete and move to next state
                        this.time.delayedCall(500, () => {
                            this.battleStateMachine.setState(
                                BATTLE_STATES.BRING_OUT_MONSTER
                            );
                        });
                    }
                );
            },
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.BRING_OUT_MONSTER,
            onEnter: () => {
                // wait for player monster to appear on the screen and notify  the player about monster
                this.battleMenu.updateInfoPanelMesssageAndWaitForInput(
                    [`go ${this.activePlayerMonster.name}!`],
                    () => {
                        // wait for text animation to complete and move to next state
                        this.time.delayedCall(500, () => {
                            this.battleStateMachine.setState(
                                BATTLE_STATES.PLAYER_INPUT
                            );
                        });
                    }
                );
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
            name: BATTLE_STATES.FINISHED,
            onEnter: () => {},
        });
        this.battleStateMachine.addState({
            name: BATTLE_STATES.FLEE_ATTEMPT,
            onEnter: () => {},
        });

        // start the state machine
        this.battleStateMachine.setState("INTRO");
    }
}
