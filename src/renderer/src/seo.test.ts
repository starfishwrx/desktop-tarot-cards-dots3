import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const rendererRoot = resolve('src/renderer')

describe('SEO and GEO assets', () => {
  it('publishes canonical metadata and valid JSON-LD on the app page', () => {
    const html = readFileSync(resolve(rendererRoot, 'index.html'), 'utf8')
    expect(html).toContain('<link rel="canonical" href="https://tarot.haixing.uk/"')
    expect(html).toContain('name="description"')
    expect(html).toContain('property="og:image"')
    expect(html).toContain('name="twitter:card"')

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    expect(jsonLd).toBeTruthy()
    const parsed = JSON.parse(jsonLd ?? '{}') as { '@graph': Array<{ '@type': string }> }
    expect(parsed['@graph'].map((entry) => entry['@type'])).toEqual([
      'WebSite',
      'WebApplication',
      'FAQPage'
    ])

    expect(html).toContain('<div id="root"></div>')
    expect(html).not.toContain('seo-fallback')
    expect(html).not.toContain('data-cf-beacon')
    expect(html).not.toContain('googletagmanager.com/gtag/js?id=')
  })

  it('exposes matching crawler and generative-engine discovery files', () => {
    const robots = readFileSync(resolve(rendererRoot, 'public/robots.txt'), 'utf8')
    const sitemap = readFileSync(resolve(rendererRoot, 'public/sitemap.xml'), 'utf8')
    const llms = readFileSync(resolve(rendererRoot, 'public/llms.txt'), 'utf8')
    const full = readFileSync(resolve(rendererRoot, 'public/llms-full.txt'), 'utf8')

    expect(robots).toContain('Sitemap: https://tarot.haixing.uk/sitemap.xml')
    expect(sitemap).toContain('<loc>https://tarot.haixing.uk/</loc>')
    expect(sitemap).toContain('<loc>https://tarot.haixing.uk/tarot-guide.html</loc>')
    expect(llms).toMatch(/^# 海星塔罗 \/ Starfish Tarot/m)
    expect(llms).toContain('https://tarot.haixing.uk/llms-full.txt')
    expect(full).toContain('Canonical URL: https://tarot.haixing.uk/')

    const guide = readFileSync(resolve(rendererRoot, 'public/tarot-guide.html'), 'utf8')
    expect(guide).toContain('<h1>')
    expect(guide).toContain('78')
  })
})
