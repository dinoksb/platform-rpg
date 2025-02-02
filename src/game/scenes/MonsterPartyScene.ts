import {
    BATTLE_ASSET_KEYS,
    HEALTH_BAR_ASSET_KEYS,
    MONSTER_PARTY_ASSET_KEYS,
    UI_ASSET_KEYS,
} from "../../assets/AssetsKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/FontKeys";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { exhaustiveGuard } from "../../utils/Guard";
import { HealthBar } from "../battle/ui/HealthBar";
import { Direction, DIRECTION } from "../common/Direction";
import { Monster } from "../interfaces/MonsterTypeDef";
import { BaseScene } from "./BaseScene";
import { SCENE_KEYS } from "./SceneKeys";

const UI_TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "#FFFFFF",
    fontSize: "24px",
} as const;

const MONSTER_PARTY_POSITIONS = {
    EVEN: {
        x: 0,
        y: 10,
    },
    ODD: {
        x: 510,
        y: 40,
    },
    increment: 150,
} as const;

interface MonsterPartySceneData {
    previousSceneName: string;
}


export class MonsterPartyScene extends BaseScene {
    private monsterPartyBackgrounds: Phaser.GameObjects.Image[];
    private cancelButton: Phaser.GameObjects.Image;
    private infoTextGameObject: Phaser.GameObjects.Text;
    private healthBars: HealthBar[];
    private healthBarsTextGameObjects: Phaser.GameObjects.Text[];
    private selectedPartyMonsterIndex: number;
    private monsters: Monster[];
    private isMovingMonster: boolean;
    private waitingForInput: boolean;
    private monsterToBeMovedIndex: number | undefined;
    private monsterContainers: Phaser.GameObjects.Container[];
    private sceneData: MonsterPartySceneData;

    constructor() {
        super({
            key: SCENE_KEYS.MONSTER_PARTY_SCENE,
        });
    }

    init(data: MonsterPartySceneData): void {
        super.init(data);

        console.log(data);

        this.sceneData = data;
        this.monsterPartyBackgrounds = [];
        this.healthBars = [];
        this.healthBarsTextGameObjects = [];
        this.selectedPartyMonsterIndex = 0;
        this.monsters = dataManager.getStore.get(
            DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
        );
        this.waitingForInput = false;
        this.isMovingMonster = false;
        this.monsterToBeMovedIndex = undefined;
        this.monsterContainers = [];
    }

    create(): void {
        super.create();

        // create custom background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
        this.add
            .tileSprite(
                0,
                0,
                this.scale.width,
                this.scale.height,
                MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND,
                0
            )
            .setOrigin(0)
            .setAlpha(0.7);

        // create button
        const buttonContainer = this.add.container(883, 519, []);
        this.cancelButton = this.add
            .image(0, 0, UI_ASSET_KEYS.BLUE_BUTTON, 0)
            .setOrigin(0)
            .setScale(0.7, 1)
            .setAlpha(0.7);
        const cancelText = this.add
            .text(66.5, 20.6, "cancel", UI_TEXT_STYLE)
            .setOrigin(0.5);
        buttonContainer.add([this.cancelButton, cancelText]);

        // create info container
        const infoContainer = this.add.container(4, this.scale.height - 69, []);
        const infoDisplay = this.add
            .rectangle(0, 0, 867, 65, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0x905ac2, 1);
        this.infoTextGameObject = this.add.text(15, 14, "", {
            fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
            color: "#000000",
            fontSize: "23px",
        });
        infoContainer.add([infoDisplay, this.infoTextGameObject]);
        this.updateInfoContainerText();

        this.monsters.forEach((monster: Monster, index: number) => {
            const isEven = index % 2 === 0;
            const x = isEven
                ? MONSTER_PARTY_POSITIONS.EVEN.x
                : MONSTER_PARTY_POSITIONS.ODD.x;
            const y =
                (isEven
                    ? MONSTER_PARTY_POSITIONS.EVEN.y
                    : MONSTER_PARTY_POSITIONS.ODD.y) +
                MONSTER_PARTY_POSITIONS.increment * Math.floor(index / 2);
            this.createMonster(x, y, monster);
        });
        this.movePlayerInputCursor(DIRECTION.NONE);
    }

    update(): void {
        super.update();

        if (this.controls.isInputLocked) {
            return;
        }

        const selectedDirection = this.controls.getDirectionKeyJustPressed();
        const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
        const wasBackKeyPressed = this.controls.wasBackKeyPressed();

        // if (this.confirmationMenu.isVisible) {
        //     this.handleInputForConfirmationMenu(
        //         wasBackKeyPressed,
        //         wasSpaceKeyPressed,
        //         selectedDirection
        //     );
        //     return;
        // }

        // if (this.menu.isVisible) {
        //     this.handleInputForMenu(
        //         wasBackKeyPressed,
        //         wasSpaceKeyPressed,
        //         selectedDirection
        //     );
        //     return;
        // }

        if (wasBackKeyPressed) {
            if (this.waitingForInput) {
                this.updateInfoContainerText();
                this.waitingForInput = false;
                return;
            }

            if (this.isMovingMonster) {
                // if we are attempting to switch monsters location, cancel action
                this.isMovingMonster = false;
                this.updateInfoContainerText();
                return;
            }

            this.goBackToPreviousScene();
            return;
        }

        if (wasSpaceKeyPressed) {
            if (this.waitingForInput) {
                this.updateInfoContainerText();
                this.waitingForInput = false;
                return;
            }

            if (this.selectedPartyMonsterIndex === -1) {
                // if we are attempting to switch monsters location, cancel action
                if (this.isMovingMonster) {
                    this.isMovingMonster = false;
                    this.updateInfoContainerText();
                    return;
                }

                this.goBackToPreviousScene();
                return;
            }

            this.moveMonsters();
            // if (this.isMovingMonster) {
            //     // make sure we select a different monster
            //     if (
            //         this.selectedPartyMonsterIndex ===
            //         this.monsterToBeMovedIndex
            //     ) {
            //         return;
            //     }

            //     this.moveMonsters();
            //     return;
            // }

            // this.menu.show();
            return;
        }

        if (this.waitingForInput) {
            return;
        }

        if (selectedDirection !== DIRECTION.NONE) {
            this.movePlayerInputCursor(selectedDirection);
            // if we are attempting to move a monster, we want to leave the text up on the screen
            if (this.isMovingMonster) {
                return;
            }
            this.updateInfoContainerText();
        }
    }

    private updateInfoContainerText() {
        if (this.selectedPartyMonsterIndex === -1) {
            this.infoTextGameObject.setText("Go back to previous menu");
            return;
        }

        this.infoTextGameObject.setText("Choose a monster");
    }

    private createMonster(
        x: number,
        y: number,
        monsterDetails: Monster
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y, []);
        const background = this.add
            .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
            .setOrigin(0)
            .setScale(1.1, 1.2);
        this.monsterPartyBackgrounds.push(background);

        const leftShadowCap = this.add
            .image(160, 67, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
            .setOrigin(0)
            .setAlpha(0.5);

        const middleShadow = this.add
            .image(
                leftShadowCap.x + leftShadowCap.width,
                y,
                HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW
            )
            .setOrigin(0)
            .setAlpha(0.5);

        middleShadow.displayWidth = 285;

        const rightShadowCap = this.add
            .image(
                middleShadow.x + middleShadow.displayWidth,
                67,
                HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW
            )
            .setOrigin(0)
            .setAlpha(0.5);

        const healthBar = new HealthBar(this, 100, 40, 240);
        healthBar.setMeterPercentageAnimated(
            monsterDetails.currentHp / monsterDetails.maxHp,
            {
                duration: 0,
                skipbattleAnimations: true,
            }
        );
        this.healthBars.push(healthBar);

        const monsterNameGameText = this.add.text(
            162,
            36,
            monsterDetails.name,
            {
                fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
                color: "#ffffff",
                fontSize: "30px",
            }
        );

        const monsterHealthBarLevelText = this.add.text(
            26,
            116,
            `Lv. ${monsterDetails.currentLevel}`,
            {
                fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
                color: "#ffffff",
                fontSize: "22px",
            }
        );
        const monsterHpText = this.add.text(164, 66, "HP", {
            fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
            color: "#FF6505",
            fontSize: "24px",
            fontStyle: "italic",
        });

        const healthBarTextGameObject = this.add
            .text(
                458,
                95,
                `${monsterDetails.currentHp}/${monsterDetails.maxHp}`,
                {
                    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
                    color: "#ffffff",
                    fontSize: "38px",
                }
            )
            .setOrigin(1, 0);
        this.healthBarsTextGameObjects.push(healthBarTextGameObject);

        const monsterImage = this.add
            .image(35, 20, monsterDetails.assetKey)
            .setOrigin(0)
            .setScale(0.35);

        container.add([
            background,
            leftShadowCap,
            middleShadow,
            rightShadowCap,
            healthBar.container,
            monsterImage,
            monsterNameGameText,
            monsterHealthBarLevelText,
            monsterHpText,
            healthBarTextGameObject,
        ]);
        return container;
    }

    private moveMonsters(): void{
        this.controls.lockInput = true;
        const sceneDataToPass ={
            monster: this.monsters[this.selectedPartyMonsterIndex]
        };
        this.scene.launch(SCENE_KEYS.MONSTER_DETAILS_SCENE, sceneDataToPass);
        this.scene.pause(SCENE_KEYS.MONSTER_PARTY_SCENE)
    }

    private goBackToPreviousScene(): void {
        this.controls.lockInput = true;
        const sceneDataToPass = {
            previousSceneName: SCENE_KEYS.WORLD_SCENE,
        }
        this.scene.stop(SCENE_KEYS.MONSTER_PARTY_SCENE);
        this.scene.resume(this.sceneData.previousSceneName);
    }

    private movePlayerInputCursor(direction: Direction): void {
        switch (direction) {
            case DIRECTION.UP:
                // if we are already at the cancel button, then reset index
                if (this.selectedPartyMonsterIndex === -1) {
                  this.selectedPartyMonsterIndex = this.monsters.length;
                }
                this.selectedPartyMonsterIndex -= 1;
                // prevent from looping to the bottom
                if (this.selectedPartyMonsterIndex < 0) {
                  this.selectedPartyMonsterIndex = 0;
                }
                this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(1);
                this.cancelButton.setTexture(UI_ASSET_KEYS.BLUE_BUTTON, 0).setAlpha(0.7);
                break;
              case DIRECTION.DOWN:
                // already at the bottom of the menu
                if (this.selectedPartyMonsterIndex === -1) {
                  break;
                }
                // increment index and check if we are pass the threshold
                this.selectedPartyMonsterIndex += 1;
                if (this.selectedPartyMonsterIndex > this.monsters.length - 1) {
                  this.selectedPartyMonsterIndex = -1;
                }
                if (this.selectedPartyMonsterIndex === -1) {
                  this.cancelButton.setTexture(UI_ASSET_KEYS.BLUE_BUTTON_SELECTED, 0).setAlpha(1);
                  break;
                }
                this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(1);
                break;
            case "LEFT":
                break;
            case "RIGHT":
                break;
            case "NONE":
                break;
            default:
                exhaustiveGuard(direction);
        }

        this.monsterPartyBackgrounds.forEach((obj: Phaser.GameObjects.Image, index: number) => {
            if(index === this.selectedPartyMonsterIndex){
                return;
            }
            obj.setAlpha(0.7);
        })
    }
}
