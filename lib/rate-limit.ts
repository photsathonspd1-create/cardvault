import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// In-memory fallback for development when Upstash is not configured
class InMemoryRateLimit {
  private store = new Map<string, { count: number; resetAt: number }>()

  async limit(identifier: string, opts: { windowMs: number; max: number }) {
    const now = Date.now()
    const key = identifier
    const entry = this.store.get(key)

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + opts.windowMs })
      return { success: true, remaining: opts.max - 1, limit: opts.max, reset: now + opts.windowMs }
    }

    if (entry.count >= opts.max) {
      return { success: false, remaining: 0, limit: opts.max, reset: entry.resetAt }
    }

    entry.count++
    return { success: true, remaining: opts.max - entry.count, limit: opts.max, reset: entry.resetAt }
  }
}

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token && url !== "http://localhost:8079") {
    return new Redis({ url, token })
  }
  return null
}

const redis = createRedis()

// Rate limiters for specific endpoints
export const rateLimiters = {
  // Card identification: 20 req/hr/user (external API calls)
  cardIdentify: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 h"), analytics: true, prefix: "rl:card-identify" })
    : new InMemoryRateLimit(),

  // Upload presigned URL: 30 req/10min/user
  upload: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "10 m"), analytics: true, prefix: "rl:upload" })
    : new InMemoryRateLimit(),

  // Create order: 20 req/hr/user
  createOrder: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 h"), analytics: true, prefix: "rl:create-order" })
    : new InMemoryRateLimit(),

  // Create listing: 10 req/hr/user
  createListing: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 h"), analytics: true, prefix: "rl:create-listing" })
    : new InMemoryRateLimit(),

  // Login: 5 req/15min/IP
  login: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), analytics: true, prefix: "rl:login" })
    : new InMemoryRateLimit(),
}

export type RateLimitResult = {
  success: boolean
  remaining: number
  limit: number
  reset: number
}

/**
 * Apply rate limit and return HTTP 429 response if exceeded
 */
export async function checkRateLimit(
  limiter: typeof rateLimiters[keyof typeof rateLimiters],
  identifier: string
): Promise<{ success: true } | { success: false; response: Response }> {
  const result = await limiter.limit(identifier, { windowMs: 60000, max: 100 })

  if (!result.success) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: "คำขอมากเกินไป กรุณาลองใหม่ภายหลัง",
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
            "X-RateLimit-Reset": String(result.reset),
          },
        }
      ),
    }
  }

  return { success: true }
}
