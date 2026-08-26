import { randomUUID } from 'node:crypto'
import express, { Express, Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { AiErrorCode, AiReadingResponse } from '../src/shared/aiReading.js'
import { createDotsClient, DotsClient, DotsClientError } from './dotsClient.js'
import { aiReadingRequestSchema } from './validation.js'

type Logger = Pick<Console, 'info' | 'error'>

export interface AppDependencies {
  dotsClient?: DotsClient
  logger?: Logger
  enableRateLimit?: boolean
}

function errorResponse(code: AiErrorCode, message: string): AiReadingResponse {
  return { ok: false, code, message }
}

function rateLimitHandler(_request: Request, response: Response): void {
  response.status(429).json(errorResponse('RATE_LIMITED', 'Too many requests; try again shortly.'))
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express()
  const dotsClient = dependencies.dotsClient ?? createDotsClient()
  const logger = dependencies.logger ?? console

  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(express.json({ limit: '32kb' }))

  if (dependencies.enableRateLimit !== false) {
    app.use(
      '/api/ai-reading',
      rateLimit({
        windowMs: 60_000,
        limit: 50,
        keyGenerator: () => 'all-visitors',
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: rateLimitHandler
      }),
      rateLimit({
        windowMs: 60_000,
        limit: 5,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: rateLimitHandler
      })
    )
  }

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true, service: 'tarot-dots-api' })
  })

  app.post('/api/ai-reading', async (request, response) => {
    const requestId = randomUUID()
    const startedAt = Date.now()
    response.setHeader('X-Request-Id', requestId)

    const parsed = aiReadingRequestSchema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid tarot reading request.'))
      logger.info({ requestId, status: 400, durationMs: Date.now() - startedAt })
      return
    }

    try {
      const result = await dotsClient.generate(parsed.data)
      response.json({ ok: true, text: result.text } satisfies AiReadingResponse)
      logger.info({
        requestId,
        status: 200,
        durationMs: Date.now() - startedAt,
        usage: result.usage
      })
    } catch (error) {
      let status = 502
      let code: AiErrorCode = 'UPSTREAM_ERROR'
      let message = 'Dots AI is temporarily unavailable.'

      if (error instanceof DotsClientError && error.kind === 'NOT_CONFIGURED') {
        status = 503
        code = 'SERVICE_NOT_CONFIGURED'
        message = 'Dots AI is not configured.'
      } else if (error instanceof DotsClientError && error.kind === 'TIMEOUT') {
        status = 504
        code = 'UPSTREAM_TIMEOUT'
        message = 'Dots AI took too long to respond.'
      }

      response.status(status).json(errorResponse(code, message))
      logger.error({ requestId, status, code, durationMs: Date.now() - startedAt })
    }
  })

  app.use((error: unknown, _request: Request, response: Response, _next: unknown) => {
    if (error instanceof SyntaxError) {
      response.status(400).json(errorResponse('INVALID_REQUEST', 'Invalid JSON body.'))
      return
    }
    response.status(500).json(errorResponse('UPSTREAM_ERROR', 'Unexpected server error.'))
  })

  return app
}
