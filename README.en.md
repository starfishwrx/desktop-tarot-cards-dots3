# 🔮 Starfish Tarot

A comic-style web tarot app with all 78 Rider-Waite-Smith cards, five spreads, upright and reversed cards, Chinese and English local readings, and optional-on-click Dots AI synthesis.

The local reading corpus always works. The browser sends only a category, question, three card IDs and orientations to a Cloudflare Worker; the Dots key never reaches the browser or repository.

Cloudflare Web Analytics is injected once at the custom-domain edge. Optional GA4 funnel analytics loads only after visitor consent and does not record question text or card IDs.

## Development

Node.js 22 or newer is required.

```bash
npm install
npm run dev
npm run check
```

For local gateway development, copy `.env.example` to `.dev.vars`, provide local-only values, and run `npm run worker:dev`. Never commit secrets.

## Deployment

The public GitHub repository is built by AI Builders Space as the `starfish-tarot` service. A Cloudflare Worker serves `tarot.haixing.uk`, proxies the web application, validates AI requests, rate-limits anonymous visitors, and calls `dots3-note-prev` with an encrypted Worker Secret. See [docs/deploy.md](docs/deploy.md).

Tarot is a reflective tool, not a prediction or professional medical, legal, or financial opinion.

Card images and metadata come from [equokka/tarot-json](https://github.com/equokka/tarot-json) under MIT; original Rider-Waite-Smith artwork is public domain in the United States. This project is MIT licensed.
