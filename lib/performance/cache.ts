interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Global cache instance
const cache = new MemoryCache()

// Cache utility functions
export function cacheGet<T>(key: string): T | null {
  return cache.get<T>(key)
}

export function cacheSet<T>(key: string, data: T, ttlMs?: number): void {
  cache.set(key, data, ttlMs)
}

export function cacheDelete(key: string): boolean {
  return cache.delete(key)
}

export function cacheClear(): void {
  cache.clear()
}

// Cache decorators for common patterns
export function withCache<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 5 * 60 * 1000): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = cacheGet<T>(key)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // Fetch fresh data
      const data = await fetcher()

      // Cache the result
      cacheSet(key, data, ttlMs)

      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

// Predefined cache keys and TTLs
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  INVOICE_STATS: (userId: string) => `user:stats:${userId}`,
  AI_MODELS: "ai:models",
  CHAIN_CONFIG: "blockchain:config",
} as const

export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 2 * 60 * 60 * 1000, // 2 hours
} as const
