import { UI_ASSET_KEYS } from "../../../../assets/AssetKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../../../assets/FontKeys";
import { exhaustiveGuard } from "../../../../utils/Guard";
import { DIRECTION, Direction } from "../../../common/Direction";

export const MENU_OPTIONS = {
    MONSTERS: "MONSTERS",
    BAG: 'BAG',
    EXIT: "EXIT",
} as const;

export type MenuOptions = (typeof MENU_OPTIONS)[keyof typeof MENU_OPTIONS];

const MENU_TEXT_STYLE = {
    fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    color: "#FFFFFF",
    fontSize: "32px",
} as const;

export class Menu {
    private scene: Phaser.Scene;
    private padding: number;
    private width: number;
    private height: number;
    private graphics: Phaser.GameObjects.Graphics;
    private container: Phaser.GameObjects.Container;
    private isVisible: boolean;
    private availableMenuOptions: MenuOptions[];
    private menuOptionsTextGameObjects: Phaser.GameObjects.Text[];
    private selectedMenuOptionIndex: number;
    private slectedMenuOption: MenuOptions;
    private userInputCursor: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.padding = 4;
        this.availableMenuOptions = [MENU_OPTIONS.MONSTERS, MENU_OPTIONS.BAG, MENU_OPTIONS.EXIT];
        this.width = 300;
        this.height =
            10 + this.padding * 2 + this.availableMenuOptions.length * 50;
        this.menuOptionsTextGameObjects = [];
        this.selectedMenuOptionIndex = 0;

        this.graphics = this.createGraphics();
        this.container = this.scene.add.container(0, 0, [this.graphics]);

        // update menu container with menu options
        for (let i = 0; i < this.availableMenuOptions.length; i += 1) {
            const y = 10 + 50 * i + this.padding;
            const textObject = this.scene.add.text(
                40 + this.padding,
                y,
                this.availableMenuOptions[i],
                MENU_TEXT_STYLE
            );
            this.menuOptionsTextGameObjects.push(textObject);
            this.container.add(textObject);
        }

        // add player input cursor
        this.userInputCursor = this.scene.add.image(
            20 + this.padding,
            28 + this.padding,
            UI_ASSET_KEYS.CURSOR_WHITE
        );
        this.userInputCursor.setScale(2.5);
        this.container.add(this.userInputCursor);

        this.hide();
    }

    public get getIsVisible(): boolean {
        return this.isVisible;
    }

    public get getSelectedMenuOption(): MenuOptions {
        return this.slectedMenuOption;
    }

    public show(): void {
        const { right, top } = this.scene.cameras.main.worldView;
        const startX = right - this.padding * 2 - this.width;
        const startY = top + this.padding * 2;

        this.container.setPosition(startX, startY);
        this.container.setAlpha(1);
        this.isVisible = true;
    }

    public hide(): void {
        this.container.setAlpha(0);
        this.selectedMenuOptionIndex = 0;
        this.moveMenuCursor(DIRECTION.NONE);
        this.isVisible = false;
    }

    public handlePlayerInput(input: Direction | "OK" | "CANCEL"): void {
        if (input === "CANCEL") {
            this.hide();
            return;
        }

        if (input === "OK") {
            this.handleSelectedMenuOption();
            return;
        }

        this.moveMenuCursor(input);
    }

    private createGraphics(): Phaser.GameObjects.Graphics {
        const g = this.scene.add.graphics();
        g.fillStyle(0x32454c, 1);
        g.fillRect(1, 0, this.width - 1, this.height - 1);
        g.lineStyle(8, 0x6d9aa8, 1);
        g.strokeRect(0, 0, this.width, this.height);
        g.setAlpha(0.9);
        return g;
    }

    private moveMenuCursor(input: Direction): void {
        switch (input) {
            case "UP":
                this.selectedMenuOptionIndex -= 1;
                if (this.selectedMenuOptionIndex < 0) {
                    this.selectedMenuOptionIndex =
                        this.availableMenuOptions.length - 1;
                }
                break;
            case "DOWN":
                this.selectedMenuOptionIndex += 1;
                if (
                    this.selectedMenuOptionIndex >
                    this.availableMenuOptions.length - 1
                ) {
                    this.selectedMenuOptionIndex = 0;
                }
                break;

            case "LEFT":
            case "RIGHT":
                return;
            case "NONE":
                break;
            default:
                exhaustiveGuard(input);
        }

        const x = 20 + this.padding;
        const y = 28 + this.padding + this.selectedMenuOptionIndex * 50;

        this.userInputCursor.setPosition(x, y);
    }

    private handleSelectedMenuOption(): void {
        this.slectedMenuOption = this.availableMenuOptions[this.selectedMenuOptionIndex];
        
    }
}
