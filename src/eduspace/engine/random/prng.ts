/**
 * EduSpace V3 Exam Engine - Deterministic Pseudo-Random Number Generator (PRNG)
 * 
 * Uses string hashing (MurmurHash3-inspired 32-bit hash) and Mulberry32 PRNG.
 * Ensures 100% reproducible question ordering, option shuffling, and variant selection.
 * STRICT: Never calls Math.random().
 */

/**
 * Hashes a string seed into a 32-bit integer for PRNG initialization.
 */
export function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') {
    return (seed | 0) || 1;
  }
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 1;
}

/**
 * Creates a deterministic PRNG function returning a float in [0, 1).
 * Algorithm: Mulberry32
 */
export function createDeterministicRng(seed: string | number): () => number {
  let a = hashSeed(seed);
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffles an array using the Fisher-Yates algorithm.
 * Returns a new array without mutating the original array.
 */
export function deterministicShuffle<T>(array: readonly T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
