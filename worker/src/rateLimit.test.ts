import { describe, expect, it } from 'vitest'
import { enforceRateLimits, hashVisitor, type RateLimitStore } from './rateLimit'

class MemoryStore implements RateLimitStore {
  private readonly counts = new Map<string, number>()
  cleanedBefore: number | null = null

  async increment(scope: string, windowStart: number, subject: string): Promise<number> {
    const key = `${scope}:${windowStart}:${subject}`
    const count = (this.counts.get(key) ?? 0) + 1
    this.counts.set(key, count)
    return count
  }

  async cleanup(beforeWindow: number): Promise<void> {
    this.cleanedBefore = beforeWindow
  }
}

describe('rate limiting', () => {
  it('allows ten readings per visitor per hour and rejects the eleventh', async () => {
    const store = new MemoryStore()
    const now = Date.UTC(2026, 7, 26, 12, 30)
    for (let index = 0; index < 10; index += 1) {
      expect((await enforceRateLimits(store, 'visitor-a', now)).allowed).toBe(true)
    }
    const denied = await enforceRateLimits(store, 'visitor-a', now)
    expect(denied).toMatchObject({ allowed: false, scope: 'visitor' })
    expect(denied.retryAfter).toBeGreaterThan(0)
  })

  it('caps aggregate traffic below the Dots RPM limit', async () => {
    const store = new MemoryStore()
    const now = Date.UTC(2026, 7, 26, 12, 31)
    for (let index = 0; index < 50; index += 1) {
      expect((await enforceRateLimits(store, `visitor-${index}`, now)).allowed).toBe(true)
    }
    const denied = await enforceRateLimits(store, 'visitor-51', now)
    expect(denied).toMatchObject({ allowed: false, scope: 'global' })
  })

  it('hashes a source without retaining the raw IP', async () => {
    const hash = await hashVisitor('203.0.113.8', 'test-salt')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).not.toContain('203.0.113.8')
  })
})
