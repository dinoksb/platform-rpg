export function weightedRandom(data: number[][]): number {
    if (data.length === 0) {
        throw new Error("Data array cannot be empty.");
    }

    // Split input into two separate arrays of values and weights.
    const values: number[] = data.map((d) => d[0]);
    const weights: number[] = data.map((d) => d[1]);

    // Calculate cumulative weights
    const cumulativeWeights: number[] = [];
    for (let i = 0; i < weights.length; i++) {
        cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
    }

    // Choose a random value based on the range from 0 to our max weight
    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomNumber = maxCumulativeWeight * Math.random();

    // Find the first element where cumulative weight exceeds randomNumber
    const index = cumulativeWeights.findIndex(
        (weight) => weight > randomNumber
    );

    return values[index];
}
