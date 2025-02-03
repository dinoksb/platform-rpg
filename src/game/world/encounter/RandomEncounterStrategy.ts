import { BATTLE_ENCOUNTER_RATE } from "../../../Config";
import { EncounterStrategy } from "../../interfaces/EncounterStrategy";

export class RandomEncounterStrategy implements EncounterStrategy {
    constructor(private encounterRate: number = BATTLE_ENCOUNTER_RATE) {}

    checkEncounter(
        playerPosition: { x: number; y: number },
        encounterLayer: Phaser.Tilemaps.TilemapLayer
    ): boolean {
        const tile = encounterLayer.getTileAtWorldXY(
            playerPosition.x,
            playerPosition.y,
            true
        );
        if (tile && tile.index !== -1) {
            return Math.random() < this.encounterRate;
        }
        return false;
    }
}
