# Desktop Tarot Web · Dots AI edition

A comic-style three-card tarot app with all 78 cards and local meanings. The web edition adds a server-side Dots reading tailored to the visitor's question.

## AI request path

```text
Browser -> POST /api/ai-reading -> Node server -> dots3-note-prev
```

The Dots API key exists only in server environment variables. The server owns the prompt, validates the structured three-card payload, and enforces limits of five requests per IP and fifty requests globally per minute.

## Development

Requires Node.js 20 or newer.

```bash
npm ci
cp .env.example .env.local
# Add DOTS_API_KEY to .env.local
npm run dev
```

Open `http://localhost:8000`.

## Verification and production

```bash
npm test
npm run typecheck
npm run build
NODE_ENV=production DOTS_API_KEY=your-server-secret npm start
```

See [`docs/deploy.md`](docs/deploy.md) for AIBuildCoach (`ai-builders.space`) deployment settings.

## License

MIT. Card art and card metadata originate from `equokka/tarot-json`; Rider-Waite-Smith artwork is public domain in the United States.
