import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../server/app.js'
import { DotsClientError } from '../server/dotsClient.js'
import { readingRequest } from './fixture.js'

const logger = { info: vi.fn(), error: vi.fn() }

describe('POST /api/ai-reading', () => {
  it('returns a generated reading without exposing upstream details', async () => {
    const app = createApp({
      dotsClient: { generate: vi.fn().mockResolvedValue({ text: '服务端生成结果' }) },
      logger,
      enableRateLimit: false
    })
    const response = await request(app).post('/api/ai-reading').send(readingRequest)
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true, text: '服务端生成结果' })
    expect(response.headers['x-request-id']).toBeTruthy()
  })

  it('rejects arbitrary messages and malformed card data', async () => {
    const app = createApp({
      dotsClient: { generate: vi.fn() },
      logger,
      enableRateLimit: false
    })
    const response = await request(app)
      .post('/api/ai-reading')
      .send({ ...readingRequest, messages: [{ role: 'user', content: 'arbitrary proxy' }] })
    expect(response.status).toBe(400)
    expect(response.body.code).toBe('INVALID_REQUEST')
  })

  it('maps missing configuration and timeouts to stable error codes', async () => {
    const notConfigured = createApp({
      dotsClient: {
        generate: vi.fn().mockRejectedValue(new DotsClientError('NOT_CONFIGURED', 'secret'))
      },
      logger,
      enableRateLimit: false
    })
    const missing = await request(notConfigured).post('/api/ai-reading').send(readingRequest)
    expect(missing.status).toBe(503)
    expect(missing.body.code).toBe('SERVICE_NOT_CONFIGURED')

    const timeoutApp = createApp({
      dotsClient: { generate: vi.fn().mockRejectedValue(new DotsClientError('TIMEOUT', 'slow')) },
      logger,
      enableRateLimit: false
    })
    const timeout = await request(timeoutApp).post('/api/ai-reading').send(readingRequest)
    expect(timeout.status).toBe(504)
    expect(timeout.body.code).toBe('UPSTREAM_TIMEOUT')
  })

  it('limits one IP to five requests per minute', async () => {
    const app = createApp({
      dotsClient: { generate: vi.fn().mockResolvedValue({ text: 'ok' }) },
      logger
    })
    for (let index = 0; index < 5; index += 1) {
      const response = await request(app).post('/api/ai-reading').send(readingRequest)
      expect(response.status).toBe(200)
    }
    const limited = await request(app).post('/api/ai-reading').send(readingRequest)
    expect(limited.status).toBe(429)
    expect(limited.body.code).toBe('RATE_LIMITED')
    expect(limited.headers['retry-after']).toBeTruthy()
  })
})
