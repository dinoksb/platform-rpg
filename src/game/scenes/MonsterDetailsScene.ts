import { MONSTER_PARTY_ASSET_KEYS } from "../../assets/AssetKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/FontKeys";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../../utils/DataManager";
import { DataUtils } from "../../utils/DataUtils";
import { Monster } from "../interfaces/TypeDef";
import { Attack } from "../interfaces/TypeDef";
import { BaseScene } from "./BaseScene";
import { SCENE_KEYS } from "./SceneKeys";

const UI_TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "#FFFFFF",
    fontSize: "24px",
} as const;

const MONSTER_MOVE_TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "#000000",
    fontSize: "40px",
} as const;


export class MonsterDatailsScene extends BaseScene {
    private monsterDetails: Monster;
    private monsterAttacks: Attack[];

    constructor() {
        super({
            key: SCENE_KEYS.MONSTER_DETAILS_SCENE,
        });
    }

    init(data): void {
        super.init(data);

        this.monsterDetails = data.monster;
        if(this.monsterDetails === undefined){
            this.monsterDetails = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)[0];
        }
        // added for testing from preload scene directly
        if (this.monsterDetails === undefined) {
            this.monsterDetails = dataManager.getStore.get(
                DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY
            )[0];
        }

        this.monsterAttacks = [];
        this.monsterDetails.attackIds.forEach((attackId) => {
            const monsterAttack = DataUtils.getMonsterAttack(this, attackId);
            if (monsterAttack !== undefined) {
                this.monsterAttacks.push(monsterAttack);
            }
        });
    }

    create(): void {
        super.create();

        // create background and title
        this.add.image(0, 0, MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILS_BACKGROUND).setOrigin(0);
        this.add.text(10, 0, 'Monster Details', {
            ...UI_TEXT_STYLE,
            fontSize: '48px',
        });

        // add monster details
        this.add.text(20, 60, `Lv.${this.monsterDetails.currentLevel}`, {
            ...UI_TEXT_STYLE,
            fontSize: '40px',
        });

        this.add.text(200, 60, this.monsterDetails.name, {
            ...UI_TEXT_STYLE,
            fontSize: '40px',
        });

        this.add.image(160, 310, this.monsterDetails.assetKey).setOrigin(0, 1).setScale(0.7);

        if(this.monsterAttacks[0] !== undefined){
            this.add.text(560, 82, this.monsterAttacks[0].name, MONSTER_MOVE_TEXT_STYLE);
        }

        if(this.monsterAttacks[1] !== undefined){
            this.add.text(560, 162, this.monsterAttacks[1].name, MONSTER_MOVE_TEXT_STYLE);
        }

        if(this.monsterAttacks[2] !== undefined){
            this.add.text(560, 242, this.monsterAttacks[2].name, MONSTER_MOVE_TEXT_STYLE);
        }

        if(this.monsterAttacks[3] !== undefined){
            this.add.text(560, 322, this.monsterAttacks[3].name, MONSTER_MOVE_TEXT_STYLE);
        }
    }

    update(): void {
        super.update();

        if (this.controls.isInputLocked) {
            return;
        }

        const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed();
        const wasBackKeyPressed = this.controls.wasBackKeyPressed();

        if(wasBackKeyPressed){
            this.goBackToPreviousScene();
        }

        if(wasSpaceKeyPressed){
            this.goBackToPreviousScene();
        }
    }

    private goBackToPreviousScene(): void {
        this.controls.lockInput = true;
        this.scene.stop(SCENE_KEYS.MONSTER_DETAILS_SCENE)
        this.scene.resume(SCENE_KEYS.MONSTER_PARTY_SCENE);
    }
}
