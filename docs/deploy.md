# AI Build Space 部署

项目现在由一个 Node 进程同时提供 Vite 静态页面和 `/api/ai-reading` 服务端接口。

## 构建与启动

- Node.js：20 或更新版本
- 安装：`npm ci`
- 构建：`npm run build`
- 启动：`NODE_ENV=production npm start`
- 健康检查：`GET /api/health`

AI Build Space 需要把构建命令设置为 `npm run build`，启动命令设置为 `npm start`，运行时环境变量设置为 `NODE_ENV=production`。

## 服务端环境变量

| 名称 | 必填 | 默认值 |
| --- | --- | --- |
| `DOTS_API_KEY` | 是 | 无 |
| `DOTS_BASE_URL` | 否 | `https://note3-prev-api.askdiandian.com` |
| `DOTS_MODEL` | 否 | `dots3-note-prev` |
| `DOTS_TIMEOUT_MS` | 否 | `30000` |
| `PORT` | 否 | `3000` |

`DOTS_API_KEY` 必须配置为服务端 Secret。不要配置成 `VITE_` 前缀变量；Vite 会把这类变量编译进浏览器代码。

## 运行模型

公开接口只接受三张牌的结构化数据。服务端负责构造系统提示词，浏览器不能传入任意 messages、模型名或上游地址。默认限流为单 IP 每分钟 5 次、全站每分钟 50 次。

当前限流存储位于 Node 进程内，部署时使用单实例。若需要横向扩容，应先把限流存储替换成 AI Build Space 的共享 KV。

## 发布检查

1. 运行 `npm test`、`npm run typecheck`、`npm run build`。
2. 配置服务端 Secret 后部署预览版本。
3. 打开 `/api/health`，确认返回 `{"ok":true,"service":"tarot-dots-api"}`。
4. 完成一组中文和一组英文抽牌，点击“生成 AI 解读”。
5. 在浏览器构建产物、Network 和服务端日志中搜索 Key 前缀，确认没有泄漏。
