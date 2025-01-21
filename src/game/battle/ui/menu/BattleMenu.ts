import { UI_ASSET_KEYS } from "../../../../assets/AssetsKeys";
import { exhaustiveGuard } from "../../../../utils/Guard";
import { Direction } from "../../../common/Direction";
import { BattleMonster } from "../../monsters/BattleMonster";
import { BATTLE_UI_TEXT_STYLE } from "./BattleMenuConfig";
import {
    ACTIVE_BATTLE_MENU,
    ActiveBattleMenu,
    ATTACK_MOVE_OPTIONS,
    AttackMoveOptions,
    BATTLE_MENU_OPTIONS,
    BattleMenuOptions,
} from "./BattleMenuOptions";

const BATTLE_MENU_CURSOR_POS = {
    x: 42,
    y: 38,
} as const;

const ATTACK_MENU_CURSOR_POS = {
    x: 42,
    y: 38,
} as const;

export class BattleMenu {
    private scene: Phaser.Scene;
    private mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
    private moveSlectionSubBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
    private battleTextGameObjectLine1: Phaser.GameObjects.Text;
    private battleTextGameObjectLine2: Phaser.GameObjects.Text;
    private mainBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private attackBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private selectedBattleMenuOption: BattleMenuOptions;
    private selectedAttackMenuOption: AttackMoveOptions;
    private activeBattleMenu: ActiveBattleMenu;
    private queuedInfoPanleMessages: string[];
    private queuedInfoPanelCallback: (() => void) | undefined;
    private waitingForPlayerInput: boolean;
    private selectedAttackIndex: number | undefined;
    private activePlayerMonster: BattleMonster;

    constructor(scene: Phaser.Scene, activePlayerMonster: BattleMonster) {
        this.scene = scene;
        this.activePlayerMonster = activePlayerMonster;
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
        this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
        this.queuedInfoPanelCallback = undefined;
        this.queuedInfoPanleMessages = [];
        this.waitingForPlayerInput = false;
        this.createMainInfoPanel();
        this.createMainBattleMenu();
        this.createMonsterAttackSubMenu();
    }

    public get selectedAttack(): number | undefined {
        if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return this.selectedAttackIndex;
        }
        return undefined;
    }

    public showMainBattleMenu() {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.battleTextGameObjectLine1.setText("what should");
        this.mainBattleMenuPhaserContainerGameObject.setAlpha(1);
        this.battleTextGameObjectLine1.setAlpha(1);
        this.battleTextGameObjectLine2.setAlpha(1);

        this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
            BATTLE_MENU_CURSOR_POS.x,
            BATTLE_MENU_CURSOR_POS.y
        );
        this.selectedAttackIndex = undefined;
    }

    public hideMainBattleMenu() {
        this.mainBattleMenuPhaserContainerGameObject.setAlpha(0);
        this.battleTextGameObjectLine1.setAlpha(0);
        this.battleTextGameObjectLine2.setAlpha(0);
    }

    public showMonsterAttackSubMenu() {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
        this.moveSlectionSubBattleMenuPhaserContainerGameObject.setAlpha(1);
    }

    public hideMonsterAttackSubMenu() {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.moveSlectionSubBattleMenuPhaserContainerGameObject.setAlpha(0);
    }

    public handlePlayerInput(input: Direction | "OK" | "CANCEL") {
        if (
            this.waitingForPlayerInput &&
            (input === "CANCEL" || input === "OK")
        ) {
            this.updateInfoPanelWithMessage();
            return;
        }

        if (input === "CANCEL") {
            this.switchToMainBattleMenu();
            return;
        }

        if (input === "OK") {
            if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
                this.handlePlayerChooseMainBattleOption();
                return;
            }
            if (
                this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
            ) {
                this.handlePlayerChooseAttack();
                return;
            }
            // this.hideMainBattleMenu();
            // this.showMonsterAttackSubMenu();
            return;
        }

        this.updateSelectedBattleMenuOptionFromInput(input);
        this.moveMainBattleMenuCursor();
        this.updateSelectedMoveMenuOptionFromInput(input);
        this.moveMoveSelectBattleMenuCursor();
    }

    public updateInfoPanelMesssageAndWaitForInput(
        message: string[],
        callback: () => void
    ) {
        this.queuedInfoPanleMessages = message;
        this.queuedInfoPanelCallback = callback;

        this.updateInfoPanelWithMessage();
    }

    private updateInfoPanelWithMessage() {
        this.waitingForPlayerInput = false;
        this.battleTextGameObjectLine1.setText("").setAlpha(1);

        // check if all messages have been displayed from the queue and call the callback
        if (this.queuedInfoPanleMessages.length === 0) {
            if (this.queuedInfoPanelCallback) {
                this.queuedInfoPanelCallback();
                this.queuedInfoPanelCallback = undefined;
            }
            return;
        }

        // get first message from queue and animate message
        const messageToDisplay = this.queuedInfoPanleMessages.shift() || "";
        this.battleTextGameObjectLine1.setText(messageToDisplay);
        this.waitingForPlayerInput = true;
    }

    private createMainBattleMenu() {
        this.battleTextGameObjectLine1 = this.scene.add.text(
            20,
            468,
            "what should",
            BATTLE_UI_TEXT_STYLE
        );
        // TODO: update to use monster data that is passed into this class instance
        this.battleTextGameObjectLine2 = this.scene.add.text(
            20,
            512,
            `${this.activePlayerMonster.name} do next?`,
            BATTLE_UI_TEXT_STYLE
        );

        this.mainBattleMenuCursorPhaserImageGameObject = this.scene.add
            .image(
                BATTLE_MENU_CURSOR_POS.x,
                BATTLE_MENU_CURSOR_POS.y,
                UI_ASSET_KEYS.CURSOR,
                0
            )
            .setOrigin(0.5)
            .setScale(2.5);

        this.mainBattleMenuPhaserContainerGameObject = this.scene.add.container(
            520,
            448,
            [
                this.createMainInfoSubPanel(),
                this.scene.add.text(
                    55,
                    22,
                    BATTLE_MENU_OPTIONS.FIGHT,
                    BATTLE_UI_TEXT_STYLE
                ),
                this.scene.add.text(
                    240,
                    22,
                    BATTLE_MENU_OPTIONS.SWITCH,
                    BATTLE_UI_TEXT_STYLE
                ),
                this.scene.add.text(
                    55,
                    70,
                    BATTLE_MENU_OPTIONS.ITEM,
                    BATTLE_UI_TEXT_STYLE
                ),
                this.scene.add.text(
                    240,
                    70,
                    BATTLE_MENU_OPTIONS.FLEE,
                    BATTLE_UI_TEXT_STYLE
                ),
                this.mainBattleMenuCursorPhaserImageGameObject,
            ]
        );

        this.hideMainBattleMenu();
    }

    private createMonsterAttackSubMenu() {
        this.attackBattleMenuCursorPhaserImageGameObject = this.scene.add
            .image(
                ATTACK_MENU_CURSOR_POS.x,
                ATTACK_MENU_CURSOR_POS.y,
                UI_ASSET_KEYS.CURSOR,
                0
            )
            .setOrigin(0.5)
            .setScale(2.5);

        const attackNames = [];
        for (let i = 0; i < 4; i += 1) {
            attackNames.push(this.activePlayerMonster.attacks[i]?.name || "-");
        }

        this.moveSlectionSubBattleMenuPhaserContainerGameObject =
            this.scene.add.container(0, 448, [
                this.scene.add.text(
                    55,
                    22,
                    attackNames[0],
                    BATTLE_UI_TEXT_STYLE
                ),
                this.scene.add.text(
                    240,
                    22,
                    attackNames[1],
                    BATTLE_UI_TEXT_STYLE
                ),
                this.scene.add.text(
                    55,
                    70,
                    attackNames[2],
                    BATTLE_UI_TEXT_STYLE
                ),
                this.scene.add.text(
                    240,
                    70,
                    attackNames[3],
                    BATTLE_UI_TEXT_STYLE
                ),
                this.attackBattleMenuCursorPhaserImageGameObject,
            ]);
        this.hideMonsterAttackSubMenu();
    }

    private createMainInfoPanel() {
        const padding = 4;
        const rectHeight = 124;

        this.scene.add
            .rectangle(
                0,
                this.scene.scale.height - rectHeight - padding,
                this.scene.scale.width - padding * 2,
                rectHeight,
                0xede4f3,
                1
            )
            .setOrigin(0)
            .setStrokeStyle(8, 0xe4434a, 1);
    }

    private createMainInfoSubPanel(): Phaser.GameObjects.Rectangle {
        const rectWidth = 500;
        const rectHeight = 124;

        return this.scene.add
            .rectangle(0, 0, rectWidth, rectHeight, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0x905ac2, 1);
    }

    private updateSelectedBattleMenuOptionFromInput(direction: Direction) {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
            switch (direction) {
                case "RIGHT":
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
                    return;
                case "DOWN":
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
                    return;
                case "LEFT":
                case "UP":
                case "NONE":
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
            switch (direction) {
                case "LEFT":
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
                    return;
                case "DOWN":
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
                    return;
                case "RIGHT":
                case "UP":
                case "NONE":
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
            switch (direction) {
                case "RIGHT":
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
                    return;
                case "UP":
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
                    return;
                case "LEFT":
                case "DOWN":
                case "NONE":
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
            switch (direction) {
                case "LEFT":
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
                    return;
                case "UP":
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
                    return;
                case "RIGHT":
                case "DOWN":
                case "NONE":
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        exhaustiveGuard(this.selectedBattleMenuOption);
    }

    private moveMainBattleMenuCursor() {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }

        switch (this.selectedBattleMenuOption) {
            case "FIGHT":
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
                    BATTLE_MENU_CURSOR_POS.x,
                    BATTLE_MENU_CURSOR_POS.y
                );
                return;
            case "SIWTCH":
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
                    228,
                    BATTLE_MENU_CURSOR_POS.y
                );
                return;
            case "ITEM":
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
                    BATTLE_MENU_CURSOR_POS.x,
                    86
                );
                return;
            case "FLEE":
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
                    228,
                    86
                );
                return;
            default:
                exhaustiveGuard(this.selectedBattleMenuOption);
                break;
        }
    }

    private updateSelectedMoveMenuOptionFromInput(direction: Direction) {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }

        if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
            switch (direction) {
                case "RIGHT":
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
                    return;
                case "DOWN":
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
                    return;
                case "LEFT":
                case "UP":
                case "NONE":
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
            switch (direction) {
                case "LEFT":
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
                    return;
                case "DOWN":
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
                    return;
                case "RIGHT":
                case "UP":
                case "NONE":
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
            switch (direction) {
                case "RIGHT":
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
                    return;
                case "UP":
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
                    return;
                case "LEFT":
                case "DOWN":
                case "NONE":
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
            switch (direction) {
                case "LEFT":
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
                    return;
                case "UP":
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
                    return;
                case "RIGHT":
                case "DOWN":
                case "NONE":
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
    }

    private moveMoveSelectBattleMenuCursor() {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }

        switch (this.selectedAttackMenuOption) {
            case "MOVE_1":
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
                    ATTACK_MENU_CURSOR_POS.x,
                    ATTACK_MENU_CURSOR_POS.y
                );
                return;
            case "MOVE_2":
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
                    228,
                    ATTACK_MENU_CURSOR_POS.y
                );
                return;
            case "MOVE_3":
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
                    ATTACK_MENU_CURSOR_POS.x,
                    86
                );
                return;
            case "MOVE_4":
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
                    228,
                    86
                );
                return;
            default:
                exhaustiveGuard(this.selectedAttackMenuOption);
        }
    }

    private switchToMainBattleMenu() {
        this.hideMonsterAttackSubMenu();
        this.showMainBattleMenu();
    }

    private handlePlayerChooseMainBattleOption() {
        this.hideMainBattleMenu();

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
            this.showMonsterAttackSubMenu();
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;
            this.updateInfoPanelMesssageAndWaitForInput(
                ["Your bag is empty..."],
                () => {
                    this.switchToMainBattleMenu();
                }
            );
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
            // TODO
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH;
            this.updateInfoPanelMesssageAndWaitForInput(
                ["You have no other monsters in your party..."],
                () => {
                    this.switchToMainBattleMenu();
                }
            );
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
            // TODO
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE;
            this.updateInfoPanelMesssageAndWaitForInput(
                ["You fail to run away..."],
                () => {
                    this.switchToMainBattleMenu();
                }
            );
            return;
        }

        exhaustiveGuard(this.selectedBattleMenuOption);
    }

    private handlePlayerChooseAttack() {
        let selectedMoveIndex = 0;
        switch (this.selectedAttackMenuOption) {
            case "MOVE_1":
                selectedMoveIndex = 0;
                break;
            case "MOVE_2":
                selectedMoveIndex = 1;
                break;
            case "MOVE_3":
                selectedMoveIndex = 2;
                break;
            case "MOVE_4":
                selectedMoveIndex = 3;
                break;
            default:
                exhaustiveGuard(this.selectedBattleMenuOption);
        }
        this.selectedAttackIndex = selectedMoveIndex;
    }
}
