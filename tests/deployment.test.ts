import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('AIBuildCoach deployment bundle', () => {
  it('uses a root Dockerfile with the runtime PORT', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8')
    expect(dockerfile).toContain('FROM node:20-alpine AS builder')
    expect(dockerfile).toContain('FROM node:20-alpine AS runtime')
    expect(dockerfile).toContain('EXPOSE 8000')
    expect(dockerfile).toContain('PORT=${PORT:-8000}')
    expect(dockerfile.match(/^CMD /gm)).toHaveLength(1)
  })

  it('targets the public fork without committing the Dots secret', () => {
    const config = JSON.parse(readFileSync('deploy-config.json', 'utf8'))
    expect(config).toMatchObject({
      repo_url: 'https://github.com/starfishwrx/desktop-tarot-cards-dots3',
      service_name: 'desktop-tarot-dots3',
      branch: 'codex/dots-web-ai',
      port: 8000
    })
    expect(config.env_vars.DOTS_API_KEY).toBeUndefined()
  })
})
