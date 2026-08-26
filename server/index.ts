import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import express from 'express'
import { createApp } from './app.js'

const app = createApp()
const port = Number(process.env.PORT ?? 3000)
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  const webRoot = resolve('dist-web')
  if (!existsSync(webRoot)) {
    throw new Error('dist-web is missing; run npm run build before npm start')
  }
  app.use(express.static(webRoot))
  app.get('*', (_request, response) => response.sendFile(resolve(webRoot, 'index.html')))
} else {
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' })
  app.use(vite.middlewares)
}

app.listen(port, () => {
  console.info(`Tarot web app listening on http://localhost:${port}`)
})
