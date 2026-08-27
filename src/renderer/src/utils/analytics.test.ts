import { describe, expect, it } from 'vitest'
import { isValidMeasurementId } from './analytics'

describe('analytics configuration', () => {
  it('accepts GA4 measurement IDs and rejects values that could alter a script URL', () => {
    expect(isValidMeasurementId('G-D23SKTMEZS')).toBe(true)
    expect(isValidMeasurementId('UA-123456-1')).toBe(false)
    expect(isValidMeasurementId('G-ID&x=1')).toBe(false)
    expect(isValidMeasurementId('')).toBe(false)
  })
})
