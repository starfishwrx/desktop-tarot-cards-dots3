import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDotsClient, DotsClientError } from '../server/dotsClient.js'
import { readingRequest } from './fixture.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Dots client', () => {
  it('uses the official endpoint, model and api-key header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '这是测试解读。' } }],
          usage: { total_tokens: 42 }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    const client = createDotsClient({ DOTS_API_KEY: 'test-secret' })
    const result = await client.generate(readingRequest)

    expect(result.text).toBe('这是测试解读。')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://note3-prev-api.askdiandian.com/v1/chat/completions')
    expect(init.headers).toMatchObject({ 'api-key': 'test-secret' })
    const body = JSON.parse(String(init.body))
    expect(body.model).toBe('dots3-note-prev')
    expect(body.stream).toBe(false)
    expect(body.chat_template_kwargs.enable_thinking).toBe(false)
  })

  it('fails closed when the server secret is missing', async () => {
    const client = createDotsClient({})
    await expect(client.generate(readingRequest)).rejects.toMatchObject<DotsClientError>({
      kind: 'NOT_CONFIGURED'
    })
  })
})
