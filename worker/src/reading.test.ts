import { describe, expect, it } from 'vitest'
import { buildDotsPayload, extractDotsText, InputError, parseReadingRequest } from './reading'

const validInput = {
  language: 'zh',
  categoryId: 'career',
  question: '',
  cards: [
    { id: 'm00', orientation: 'upright' },
    { id: 'w01', orientation: 'reversed' },
    { id: 'c01', orientation: 'upright' }
  ]
}

describe('reading request validation', () => {
  it('accepts three known unique cards and builds a fixed Dots request', () => {
    const reading = parseReadingRequest(validInput)
    const payload = buildDotsPayload(reading) as {
      model: string
      messages: Array<{ content: string }>
      chat_template_kwargs: { enable_thinking: boolean }
    }

    expect(reading.cards).toHaveLength(3)
    expect(payload.model).toBe('dots3-note-prev')
    expect(payload.chat_template_kwargs.enable_thinking).toBe(false)
    expect(payload.messages[1].content).toContain('愚者')
    expect(JSON.stringify(payload)).not.toContain('api-key')
  })

  it('rejects duplicate or unknown cards', () => {
    expect(() =>
      parseReadingRequest({
        ...validInput,
        cards: [validInput.cards[0], validInput.cards[0], validInput.cards[2]]
      })
    ).toThrow(InputError)
    expect(() =>
      parseReadingRequest({
        ...validInput,
        cards: [...validInput.cards.slice(0, 2), { id: 'not-a-card', orientation: 'upright' }]
      })
    ).toThrow(InputError)
  })

  it('requires a custom question and caps its length', () => {
    expect(() => parseReadingRequest({ ...validInput, categoryId: 'custom' })).toThrow(InputError)
    expect(() => parseReadingRequest({ ...validInput, question: 'x'.repeat(301) })).toThrow(InputError)
  })
})

describe('Dots response parsing', () => {
  it('extracts only the final assistant text', () => {
    expect(
      extractDotsText({
        choices: [{ message: { content: '  最终解读  ', reasoning_content: 'private reasoning' } }]
      })
    ).toBe('最终解读')
  })

  it('rejects malformed responses', () => {
    expect(extractDotsText({ choices: [] })).toBeNull()
  })
})
