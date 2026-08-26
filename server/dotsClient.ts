import {
  AiReadingRequest,
  buildReadingPrompt,
  TAROT_SYSTEM_PROMPT
} from '../src/shared/aiReading.js'

export interface DotsResult {
  text: string
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
}

export interface DotsClient {
  generate(request: AiReadingRequest): Promise<DotsResult>
}

export class DotsClientError extends Error {
  constructor(
    public readonly kind: 'NOT_CONFIGURED' | 'TIMEOUT' | 'UPSTREAM',
    message: string,
    public readonly status?: number
  ) {
    super(message)
  }
}

interface DotsCompletion {
  choices?: Array<{ message?: { content?: string } }>
  usage?: DotsResult['usage']
}

export function createDotsClient(env: NodeJS.ProcessEnv = process.env): DotsClient {
  const apiKey = env.DOTS_API_KEY?.trim()
  const baseUrl = (env.DOTS_BASE_URL ?? 'https://note3-prev-api.askdiandian.com').replace(
    /\/$/,
    ''
  )
  const model = env.DOTS_MODEL ?? 'dots3-note-prev'
  const timeoutMs = Number(env.DOTS_TIMEOUT_MS ?? 30_000)

  return {
    async generate(request): Promise<DotsResult> {
      if (!apiKey) {
        throw new DotsClientError('NOT_CONFIGURED', 'Dots API is not configured')
      }

      let response: Response
      try {
        response = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: TAROT_SYSTEM_PROMPT },
              { role: 'user', content: buildReadingPrompt(request) }
            ],
            stream: false,
            max_tokens: 1024,
            chat_template_kwargs: { enable_thinking: false }
          }),
          signal: AbortSignal.timeout(timeoutMs)
        })
      } catch (error) {
        if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
          throw new DotsClientError('TIMEOUT', 'Dots API request timed out')
        }
        throw new DotsClientError('UPSTREAM', 'Dots API request failed')
      }

      if (!response.ok) {
        throw new DotsClientError('UPSTREAM', 'Dots API returned an error', response.status)
      }

      const data = (await response.json()) as DotsCompletion
      const text = data.choices?.[0]?.message?.content?.trim()
      if (!text) {
        throw new DotsClientError('UPSTREAM', 'Dots API returned no reading')
      }

      return { text, usage: data.usage }
    }
  }
}
