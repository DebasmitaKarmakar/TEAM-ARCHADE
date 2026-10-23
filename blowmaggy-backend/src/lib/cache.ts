/** Tiny in-memory TTL cache (swap for Redis/Upstash when you run more than one instance). */
interface Entry { value: unknown; expires: number }
const store = new Map<string, Entry>();
const MAX_ENTRIES = 2_000;

export const cache = {
  get<T>(key: string): T | undefined {
    const e = store.get(key);
    if (!e) return undefined;
    if (e.expires < Date.now()) { store.delete(key); return undefined; }
    return e.value as T;
  },
  set(key: string, value: unknown, ttlSeconds: number) {
    if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value as string);
    store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  },
  async wrap<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const hit = cache.get<T>(key);
    if (hit !== undefined) return hit;
    const value = await fn();
    cache.set(key, value, ttlSeconds);
    return value;
  },
  /** Delete every key starting with prefix (call after admin edits). */
  invalidate(prefix = '') {
    for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
  },
};
