import { MONSTER_ASSET_KEYS } from "../../../../assets/AssetsKeys";
import { Direction, DIRECTION } from "../../../common/Direction";

const BATTLE_MENU_OPTIONS = Object.freeze({
    FIGHT: "FIGHT",
    SWITCH: "SIWTCH",
    ITEM: "ITEM",
    FLEE: "FLEE",
});

const battleUITextStyle = {
    color: "black",
    fontSize: "30px",
};

export class BattleMenu {
    private scene: Phaser.Scene;
    private mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
    private moveSlectionSubBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
    private battleTextGameObjectLine1: Phaser.GameObjects.Text;
    private battleTextGameObjectLine2: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.createMainInfoPanel();
        this.createMainBattleMenu();
        this.createMonsterAttackSubMenu();
    }

    public showMainBattleMenu() {
        this.mainBattleMenuPhaserContainerGameObject.setAlpha(1);
        this.battleTextGameObjectLine1.setAlpha(1);
        this.battleTextGameObjectLine2.setAlpha(1);
    }

    public hideMainBattleMenu() {
        this.mainBattleMenuPhaserContainerGameObject.setAlpha(0);
        this.battleTextGameObjectLine1.setAlpha(0);
        this.battleTextGameObjectLine2.setAlpha(0);
    }

    public showMonsterAttackSubMenu() {
        this.moveSlectionSubBattleMenuPhaserContainerGameObject.setAlpha(1);
    }

    public hideMonsterAttackSubMenu() {
        this.moveSlectionSubBattleMenuPhaserContainerGameObject.setAlpha(0);
    }

    public handlePlayerInput(input: Direction | 'OK' | 'CANCEL') {
        console.log(input);

        if (input === "CANCEL") {
            this.hideMonsterAttackSubMenu();
            this.showMainBattleMenu();
            return;
        }

        if (input === "OK") {
            this.hideMainBattleMenu();
            this.showMonsterAttackSubMenu();
        }
    }

    private createMainBattleMenu() {
        this.battleTextGameObjectLine1 = this.scene.add.text(
            20,
            468,
            "what should",
            battleUITextStyle
        );
        // TODO: update to use monster data that is passed into this class instance
        this.battleTextGameObjectLine2 = this.scene.add.text(
            20,
            512,
            `${MONSTER_ASSET_KEYS.IGUANIGNITE} do next?`,
            battleUITextStyle
        );
        this.mainBattleMenuPhaserContainerGameObject = this.scene.add.container(
            520,
            448,
            [
                this.createMainInfoSubPanel(),
                this.scene.add.text(
                    55,
                    22,
                    BATTLE_MENU_OPTIONS.FIGHT,
                    battleUITextStyle
                ),
                this.scene.add.text(
                    240,
                    22,
                    BATTLE_MENU_OPTIONS.SWITCH,
                    battleUITextStyle
                ),
                this.scene.add.text(
                    55,
                    70,
                    BATTLE_MENU_OPTIONS.ITEM,
                    battleUITextStyle
                ),
                this.scene.add.text(
                    240,
                    70,
                    BATTLE_MENU_OPTIONS.FLEE,
                    battleUITextStyle
                ),
            ]
        );

        this.hideMainBattleMenu();
    }

    private createMonsterAttackSubMenu() {
        this.moveSlectionSubBattleMenuPhaserContainerGameObject =
            this.scene.add.container(0, 448, [
                this.scene.add.text(55, 22, "slash", battleUITextStyle),
                this.scene.add.text(240, 22, "growl", battleUITextStyle),
                this.scene.add.text(55, 70, "-", battleUITextStyle),
                this.scene.add.text(240, 70, "-", battleUITextStyle),
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
}
