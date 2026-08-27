import { describe, expect, it } from 'vitest'
import { cacheControlFor } from './index'

describe('origin proxy cache policy', () => {
  it('keeps fingerprinted bundles immutable', () => {
    expect(cacheControlFor('/assets/index-D8WCHEdL.js', 'text/javascript')).toContain('immutable')
    expect(cacheControlFor('/assets/card-a1b2c3.jpg', 'image/jpeg')).toContain('max-age=31536000')
  })

  it('keeps HTML immediately revalidatable in browsers', () => {
    expect(cacheControlFor('/', 'text/html; charset=utf-8')).toContain('max-age=0')
    expect(cacheControlFor('/', 'text/html; charset=utf-8')).toContain('s-maxage=300')
    expect(cacheControlFor('/tarot-guide.html', null)).toContain('max-age=0')
  })
})
