/** Deterministic RNG so every `npm run db:reset` produces the same demo store. */
export function createRng(seed = 20261023) {
  let s = seed >>> 0;
  const next = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (a: number, b: number) => a + Math.floor(next() * (b - a + 1));
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)];
  const chance = (p: number) => next() < p;
  const weighted = <T>(items: readonly (readonly [T, number])[]) => {
    const total = items.reduce((a, [, w]) => a + w, 0);
    let r = next() * total;
    for (const [v, w] of items) { if ((r -= w) <= 0) return v; }
    return items[items.length - 1][0];
  };
  const shuffle = <T>(arr: T[]) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  return { next, int, pick, chance, weighted, shuffle };
}

export const cross = (axes: Record<string, string[]>) =>
  Object.entries(axes).reduce<Record<string, string>[]>((acc, [k, vals]) => acc.flatMap((a) => vals.map((v) => ({ ...a, [k]: v }))), [{}]);
