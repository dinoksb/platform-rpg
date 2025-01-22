export const ATTACK_KEYS = {
    ICE_SHARD: 'ICE_SHARD',
    SLASH: 'SLASH',
} as const;

export type AttackKeys = (typeof ATTACK_KEYS)[keyof typeof ATTACK_KEYS];
