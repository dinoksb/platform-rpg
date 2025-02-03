import { EncounterStrategy } from "../../interfaces/EncounterStrategy";

export class StepBasedEncounterStrategy implements EncounterStrategy {
    private stepCounter: number = 0;
    private threshold: number;

    constructor(threshold: number = 10) {
        this.threshold = threshold;
    }

    checkEncounter(
        playerPosition: { x: number; y: number },
        encounterLayer: Phaser.Tilemaps.TilemapLayer
    ): boolean {
        const tile = encounterLayer.getTileAtWorldXY(
            playerPosition.x,
            playerPosition.y,
            true
        );

        if (!tile || tile.index === -1) {
            this.stepCounter = 0;
            return false;
        }

        this.stepCounter++;
        console.log(
            `StepBasedEncounterStrategy: stepCounter is now ${this.stepCounter}`
        );

        if (this.stepCounter >= this.threshold) {
            this.stepCounter = 0;
            return true;
        }

        return false;
    }
}
