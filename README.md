# 🔮 海星塔罗 · Starfish Tarot

漫画风格的纯网页塔罗应用：完整 78 张 Rider-Waite-Smith 牌、五种牌阵、正逆位、中英双语、本地完整解读，以及由小红书 Dots 提供的 AI 深度解读。

> 塔罗是一面镜子，不是预言。它用于观察模式与选择，不替代医疗、法律或财务专业意见。

## 功能

- 78 张牌全部随网页发布，不依赖外部图片服务。
- 爱情、事业、财运、整体运势和自定义问题五种牌阵。
- 本地牌义、位置透镜、牌面象征、注意事项和牌阵结构分析始终可用。
- 结果页可点击“请 Dots 解读”，按问题、牌阵位置和三张牌的关系生成综合解读。
- Dots API Key 只存在 Cloudflare Worker Secret 中，浏览器和 GitHub 均不可见。
- 匿名免费使用；单个来源每小时最多 10 次 AI 解读。

## 本地开发

需要 Node.js 22+。

```bash
npm install
npm run dev
```

网页位于 `http://localhost:5173`。本地调试 AI 网关时，复制 `.env.example` 为 `.dev.vars` 并填入本地值，然后运行：

```bash
npm run worker:dev
```

不要提交 `.dev.vars`、`.env`、`deploy-config.json` 或任何真实密钥。

## 验证

```bash
npm run check
docker build -t starfish-tarot .
docker run --rm -p 8000:8000 -e PORT=8000 starfish-tarot
```

容器的健康检查地址为 `http://localhost:8000/healthz`。

## 部署

主应用从本公开仓库部署到 AI Builders Space，服务名为 `starfish-tarot`。Cloudflare Worker 绑定 `tarot.haixing.uk`，代理网页并在 `/api/reading` 安全调用 Dots。完整步骤见 [部署文档](docs/deploy.md)。

## 数据来源与许可

卡牌图与名称/花色元数据来自 [equokka/tarot-json](https://github.com/equokka/tarot-json)（MIT）；Rider-Waite-Smith 原始牌面在美国属于公有领域。项目以 [MIT License](LICENSE) 开源。
