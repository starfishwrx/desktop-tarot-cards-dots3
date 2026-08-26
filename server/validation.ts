import { z } from 'zod'

const shortText = z.string().trim().min(1).max(240)
const longText = z.string().trim().min(1).max(2000)

const cardSchema = z
  .object({
    position: shortText,
    positionDescription: longText,
    positionLens: z.string().trim().max(1000),
    name: shortText,
    arcana: z.enum(['major', 'minor']),
    suit: z.string().trim().max(80).optional(),
    element: z.string().trim().max(80).optional(),
    number: z.number().int().min(0).max(21),
    orientation: z.enum(['upright', 'reversed']),
    keywords: z.array(z.string().trim().min(1).max(100)).min(1).max(20),
    localMeaning: longText,
    symbolism: longText,
    watchFor: longText
  })
  .strict()

export const aiReadingRequestSchema = z
  .object({
    language: z.enum(['zh', 'en']),
    question: z.string().trim().min(1).max(500),
    categoryName: shortText,
    cards: z.array(cardSchema).length(3),
    signals: z
      .object({
        majorCount: z.number().int().min(0).max(3),
        reversedCount: z.number().int().min(0).max(3),
        dominantSuit: z.string().trim().max(80).nullable(),
        dominantElement: z.string().trim().max(80).nullable(),
        repeatedNumbers: z.array(z.number().int().min(0).max(21)).max(3)
      })
      .strict()
  })
  .strict()
