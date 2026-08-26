export interface RateLimitStore {
  increment(scope: string, windowStart: number, subject: string): Promise<number>
  cleanup(beforeWindow: number): Promise<void>
}

export class D1RateLimitStore implements RateLimitStore {
  constructor(private readonly db: D1Database) {}

  async increment(scope: string, windowStart: number, subject: string): Promise<number> {
    const row = await this.db
      .prepare(
        `INSERT INTO rate_limits (scope, window_start, subject_hash, count)
         VALUES (?1, ?2, ?3, 1)
         ON CONFLICT(scope, window_start, subject_hash)
         DO UPDATE SET count = count + 1
         RETURNING count`
      )
      .bind(scope, windowStart, subject)
      .first<{ count: number }>()
    if (!row) throw new Error('RATE_LIMIT_STORE_FAILED')
    return row.count
  }

  async cleanup(beforeWindow: number): Promise<void> {
    await this.db.prepare('DELETE FROM rate_limits WHERE window_start < ?1').bind(beforeWindow).run()
  }
}

export interface LimitDecision {
  allowed: boolean
  retryAfter: number
  scope?: 'visitor' | 'global'
}

export async function hashVisitor(ip: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function enforceRateLimits(
  store: RateLimitStore,
  visitorHash: string,
  nowMs = Date.now()
): Promise<LimitDecision> {
  const nowSeconds = Math.floor(nowMs / 1000)
  const hourStart = Math.floor(nowSeconds / 3600) * 3600
  const visitorCount = await store.increment('visitor-hour', hourStart, visitorHash)
  if (visitorCount > 10) {
    return { allowed: false, scope: 'visitor', retryAfter: hourStart + 3600 - nowSeconds }
  }

  const minuteStart = Math.floor(nowSeconds / 60) * 60
  const globalCount = await store.increment('global-minute', minuteStart, 'global')
  if (globalCount > 50) {
    return { allowed: false, scope: 'global', retryAfter: minuteStart + 60 - nowSeconds }
  }

  if (globalCount === 1 && Math.floor(minuteStart / 60) % 60 === 0) {
    await store.cleanup(hourStart - 48 * 3600)
  }
  return { allowed: true, retryAfter: 0 }
}
