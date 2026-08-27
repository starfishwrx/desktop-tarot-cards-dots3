# AIBuildCoach 部署

部署目标是 AIBuildCoach 提供的 `ai-builders.space`。平台会从公开 GitHub 仓库拉取指定分支，通过根目录 `Dockerfile` 构建并运行单个容器。

## 已配置参数

部署参数位于根目录 [`deploy-config.json`](../deploy-config.json)：

- 仓库：`https://github.com/starfishwrx/desktop-tarot-cards-dots3`
- 服务名：`desktop-tarot-dots3`
- 分支：`codex/dots-web-ai`
- 公开地址：`https://desktop-tarot-dots3.ai-builders.space`
- 端口：读取平台提供的 `PORT`，默认 `8000`

项目由同一个 Express 进程提供 Vite 静态页面、`POST /api/ai-reading` 和 `GET /api/health`，没有第二个 Web 进程或后台任务。

## Docker 构建

`Dockerfile` 使用两个阶段：

1. Builder 阶段安装完整依赖，执行类型检查和前后端构建。
2. Runtime 阶段只安装生产依赖，并复制 `dist-web` 与 `dist-server`。

容器启动命令为：

```sh
sh -c "PORT=${PORT:-8000} node dist-server/server/index.js"
```

## 环境变量

`deploy-config.json` 只保存非敏感配置：

| 名称 | 值 |
| --- | --- |
| `NODE_ENV` | `production` |
| `DOTS_BASE_URL` | `https://note3-prev-api.askdiandian.com` |
| `DOTS_MODEL` | `dots3-note-prev` |
| `DOTS_TIMEOUT_MS` | `30000` |

`DOTS_API_KEY` 只在实际部署请求中注入，不写入 `deploy-config.json`、GitHub、Docker 镜像层或前端构建产物。AIBuildCoach 自带的 `AI_BUILDER_TOKEN` 由平台自动注入，不需要放进部署参数。

## 发布与回读

1. 本地运行 `npm test`、`npm run typecheck`、`npm run build`。
2. 可用 Docker 时执行 `docker build -t desktop-tarot-dots3 .`。
3. 将 `codex/dots-web-ai` 推送到公开 GitHub 仓库。
4. 调用 AIBuildCoach 的 `POST /v1/deployments`，同时注入运行期 `DOTS_API_KEY`。
5. 查询部署状态和日志，直到服务进入健康状态。
6. 验证 `/api/health`、中文解读、英文解读和每 IP 限流。
