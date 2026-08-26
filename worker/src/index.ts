import { buildDotsPayload, extractDotsText, InputError, parseReadingRequest } from './reading'
import { D1RateLimitStore, enforceRateLimits, hashVisitor } from './rateLimit'

interface Env {
  DB: D1Database
  DOTS_API_KEY: string
  RATE_LIMIT_SALT: string
  ORIGIN_URL: string
  DOTS_BASE_URL: string
}

const allowedOrigins = new Set([
  'https://tarot.haixing.uk',
  'https://starfish-tarot.ai-builders.space',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
])

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin')
  if (!origin || !allowedOrigins.has(origin)) return { Vary: 'Origin' }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin'
  }
}

function json(request: Request, body: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders(request), ...extraHeaders, 'Cache-Control': 'no-store' }
  })
}

async function callDots(env: Env, body: Record<string, unknown>): Promise<string> {
  if (!env.DOTS_API_KEY) throw new Error('DOTS_NOT_CONFIGURED')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const response = await fetch(`${env.DOTS_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': env.DOTS_API_KEY },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`DOTS_UPSTREAM_${response.status}`)
    const text = extractDotsText(await response.json())
    if (!text) throw new Error('DOTS_INVALID_RESPONSE')
    return text
  } finally {
    clearTimeout(timeout)
  }
}

async function handleReading(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin')
  if (origin && !allowedOrigins.has(origin)) {
    return json(request, { error: { code: 'ORIGIN_DENIED', message: '请求来源不受支持。' } }, 403)
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) })
  if (request.method !== 'POST') {
    return json(request, { error: { code: 'METHOD_NOT_ALLOWED', message: '只支持 POST 请求。' } }, 405)
  }
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return json(request, { error: { code: 'INVALID_CONTENT_TYPE', message: '请求必须使用 JSON。' } }, 415)
  }
  const declaredLength = Number(request.headers.get('Content-Length') || 0)
  if (declaredLength > 16_384) {
    return json(request, { error: { code: 'PAYLOAD_TOO_LARGE', message: '请求内容过大。' } }, 413)
  }

  try {
    const raw = await request.text()
    if (raw.length > 16_384) {
      return json(request, { error: { code: 'PAYLOAD_TOO_LARGE', message: '请求内容过大。' } }, 413)
    }
    const reading = parseReadingRequest(JSON.parse(raw))
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const visitorHash = await hashVisitor(ip, env.RATE_LIMIT_SALT)
    const decision = await enforceRateLimits(new D1RateLimitStore(env.DB), visitorHash)
    if (!decision.allowed) {
      const message =
        reading.language === 'zh'
          ? '本时段的免费解读次数已用完，请稍后再试。'
          : 'The free reading limit for this period has been reached. Please try later.'
      return json(
        request,
        { error: { code: 'RATE_LIMITED', message } },
        429,
        { 'Retry-After': String(Math.max(1, decision.retryAfter)) }
      )
    }

    return json(request, { text: await callDots(env, buildDotsPayload(reading)) })
  } catch (error) {
    if (error instanceof InputError || error instanceof SyntaxError) {
      return json(
        request,
        { error: { code: 'INVALID_REQUEST', message: error instanceof InputError ? error.message : 'JSON 格式不正确。' } },
        400
      )
    }
    const timedOut = error instanceof Error && error.name === 'AbortError'
    return json(
      request,
      {
        error: {
          code: timedOut ? 'AI_TIMEOUT' : 'AI_UNAVAILABLE',
          message: timedOut ? 'AI 响应超时，请稍后重试。' : 'AI 暂时不可用，请稍后重试。'
        }
      },
      timedOut ? 504 : 502
    )
  }
}

async function proxyToOrigin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 })
  }
  const incoming = new URL(request.url)
  const target = new URL(`${incoming.pathname}${incoming.search}`, env.ORIGIN_URL)
  const response = await fetch(new Request(target, request))
  return new Response(response.body, response)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/reading') return handleReading(request, env)
    if (url.pathname === '/healthz') {
      return Response.json({ status: 'ok', gateway: 'cloudflare' })
    }
    return proxyToOrigin(request, env)
  }
} satisfies ExportedHandler<Env>
