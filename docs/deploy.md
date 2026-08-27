# 部署说明

生产环境由两层组成：

1. AI Builders Space 从公开 GitHub 仓库构建 Docker 镜像，以单进程提供网页。
2. Cloudflare Worker 绑定 `tarot.haixing.uk`，代理网页，并在 `/api/reading` 调用 Dots。

## AI Builders Space

- Repository: `https://github.com/starfishwrx/desktop-tarot-cards-dots3`
- Branch: `main`
- Service name: `starfish-tarot`
- Port: `8000`

容器必须读取平台注入的 `PORT`。部署完成后，等待状态变为 `HEALTHY`，并验证：

```text
https://starfish-tarot.ai-builders.space/healthz
```

AI Builders Space 不保存 Dots Key；不要通过部署 `env_vars` 传递第三方秘密。

## Cloudflare

`wrangler.jsonc` 定义 Worker、D1 绑定、AI Builders 源站和自定义域名。首次部署：

```bash
npx wrangler login
npx wrangler d1 create starfish-tarot-rate-limit
# 把返回的 database_id 写入 wrangler.jsonc
npx wrangler d1 migrations apply starfish-tarot-rate-limit --remote
npx wrangler deploy
npx wrangler secret put DOTS_API_KEY
npx wrangler secret put RATE_LIMIT_SALT
```

真实值只能通过 Wrangler Secret 或 Cloudflare 控制台 Secret 写入。不得写入 `.env.example`、`wrangler.jsonc`、GitHub Actions 或仓库历史。

Worker Custom Domain 为 `tarot.haixing.uk`。如果该主机名已有 DNS 记录，先确认用途，不要直接覆盖。

Cloudflare Web Analytics 只通过域名控制台自动注入，不要再把 beacon 脚本写入 `index.html`，否则会重复统计。GA4 ID 可在构建时用 `VITE_GA_MEASUREMENT_ID` 覆盖；默认 ID 已配置，但脚本只在访客明确允许后加载。HTML 在浏览器端立即重新验证，哈希静态资源长期缓存，Worker 在边缘短暂缓存 HTML。

## 发布验收

- AI Builders 状态为 `HEALTHY`。
- `https://tarot.haixing.uk/healthz` 返回 `gateway: cloudflare`。
- 首页、牌图、中英文切换和移动端布局正常。
- 一次真实 AI 解读返回 Dots 生成的文本。
- 第 11 次同来源小时请求返回 HTTP 429。
- 仓库、镜像和公开日志中没有任何真实 AK。
