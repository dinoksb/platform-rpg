export interface EncounterStrategy {
    checkEncounter(
        playerPosition: { x: number; y: number },
        encounterLayer: Phaser.Tilemaps.TilemapLayer
    ): boolean;
}
