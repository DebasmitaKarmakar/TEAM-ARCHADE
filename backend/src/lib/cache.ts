import { LRUCache } from 'lru-cache';

// In-memory LRU cache (Redis upgrade later if needed)
const cache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 min default
});

export async function cacheGet<T>(key: string): Promise<T | null> {
  const val = cache.get(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlMs?: number): Promise<void> {
  cache.set(key, JSON.stringify(value), { ttl: ttlMs });
}

export async function cacheDel(key: string): Promise<void> {
  cache.delete(key);
}

export async function cacheFlush(pattern?: string): Promise<void> {
  if (!pattern) {
    cache.clear();
    return;
  }
  // Simple pattern matching for key prefix
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) cache.delete(key);
  }
}
