import express from 'express'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const app = express()
const port = Number.parseInt(process.env.PORT || '8000', 10)
const distDir = resolve(process.cwd(), 'dist-web')
const publicGateway = 'https://tarot.haixing.uk/api/reading'

if (!existsSync(distDir)) {
  throw new Error('dist-web is missing; run npm run build before starting the server')
}

app.disable('x-powered-by')
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

app.get('/healthz', (_request, response) => {
  response.json({ status: 'ok' })
})

// The public custom domain normally handles this route at the edge. Keep the
// AI Builders fallback URL functional without ever storing the Dots key here.
app.post('/api/reading', (_request, response) => {
  response.redirect(307, publicGateway)
})

app.use(express.static(distDir, { index: 'index.html', maxAge: '1h' }))
app.use((request, response, next) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next()
  response.sendFile(resolve(distDir, 'index.html'))
})

app.use((_request, response) => {
  response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Starfish Tarot listening on port ${port}`)
})
