# 🔮 桌面塔罗 Web · Dots AI 版

一个漫画风格的三张牌塔罗应用。78 张牌和本地牌意继续离线存在，网页版额外通过服务端调用小红书 Dots 模型生成针对当前问题的深度解读。

## 现在的 AI 调用链

```text
浏览器 → POST /api/ai-reading → Node 服务端 → dots3-note-prev
```

浏览器只发送三张牌、牌阵结构和问题。Dots API Key 只存在于服务端环境变量，不会编译进网页。服务端固定系统提示词、校验请求结构，并执行单 IP 每分钟 5 次、全站每分钟 50 次的限流。

## 本地运行

需要 Node.js 20+。

```bash
npm ci
copy .env.example .env.local
# 在 .env.local 中填写 DOTS_API_KEY
npm run dev
```

打开 `http://localhost:8000`。

## 测试与构建

```bash
npm test
npm run typecheck
npm run build
```

生产环境：

```bash
set NODE_ENV=production
set DOTS_API_KEY=your-server-secret
npm start
```

AIBuildCoach（`ai-builders.space`）的完整配置见 [`docs/deploy.md`](docs/deploy.md)。

## 功能

- 完整 78 张 Rider-Waite-Smith 塔罗牌，支持正逆位
- 爱情、事业、财运、整体运势和自定义问题
- 中英双语本地牌意、位置透镜和牌阵结构分析
- 网页版始终显示 Dots AI 解读按钮
- Dots 失败不影响本地牌意和重新抽牌
- 服务端密钥、结构校验、限流、超时与稳定错误码

## API

`POST /api/ai-reading` 只接受固定 `AiReadingRequest`，成功返回：

```json
{"ok":true,"text":"AI 解读"}
```

失败错误码：`INVALID_REQUEST`、`RATE_LIMITED`、`UPSTREAM_TIMEOUT`、`UPSTREAM_ERROR`、`SERVICE_NOT_CONFIGURED`。

## License

MIT。卡牌图与名称/花色元数据来自 `equokka/tarot-json`；Rider-Waite-Smith 牌面在美国属于公有领域。
