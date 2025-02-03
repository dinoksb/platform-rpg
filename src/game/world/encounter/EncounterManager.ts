import { EncounterStrategy } from "../../interfaces/EncounterStrategy";

export class EncounterManager {
    private strategy: EncounterStrategy;

    constructor(initialStrategy: EncounterStrategy) {
        this.strategy = initialStrategy;
    }

    setStrategy(newStrategy: EncounterStrategy) {
        this.strategy = newStrategy;
    }

    checkEncounter(
        playerPosition: { x: number; y: number },
        encounterLayer: Phaser.Tilemaps.TilemapLayer
    ): boolean {
        return this.strategy.checkEncounter(playerPosition, encounterLayer);
    }

    getStrategy(): EncounterStrategy {
        return this.strategy;
    }
}
