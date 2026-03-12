# EaseCation User Center MCP Server

面向 `easecation-user-center` 的现代 MCP Server，基于最新的 TypeScript SDK 设计思路实现，支持：

- `McpServer` 声明式工具注册
- `structuredContent + outputSchema`
- tool annotations（只读/副作用提示）
- `stdio` 与 `Streamable HTTP` 双 transport
- 管理员态 `admin_*` 工具
- 用户态 `me_*` 工具，适合个人 agent 服务

## 核心定位

这个仓库不是简单把 UC 后端接口“裸转发”成 MCP。

它做了三层整理：

1. 把管理员态和用户态分开，避免权限语义混乱。
2. 把返回值统一成结构化 MCP 输出，便于 agent 稳定消费。
3. 提供几个面向 agent 的聚合工具，例如：
   - `me_get_account_overview`
   - `me_get_ecid_overview`
   - `admin_get_player_snapshot`

## 环境要求

- Node.js 18+
- 推荐 Node.js 22+

## 安装

```bash
npm install
```

## 配置

复制环境变量模板：

```bash
cp .env.example .env
```

### 常用配置项

- `EC_API_BASE_URL`
  默认 `http://127.0.0.1:9000`，真实环境建议显式设置成 UC 后端域名
- `EC_ENABLE_ADMIN_TOOLS`
  是否启用管理员态工具
- `EC_ENABLE_USER_TOOLS`
  是否启用用户态工具
- `EC_ADMIN_JWT_TOKEN`
  管理员 access token
- `EC_ADMIN_REFRESH_TOKEN`
  管理员 refresh token。配置后会在 access token 失效时自动续期
- `EC_USER_JWT_TOKEN`
  用户 access token
- `EC_USER_REFRESH_TOKEN`
  用户 refresh token。配置后会在 access token 失效时自动续期
- `MCP_TRANSPORT`
  `stdio` 或 `streamable-http`
- `MCP_HTTP_BEARER_TOKEN`
  远程 `streamable-http` 入口的 Bearer Token。只要把真实 UC token 部署到云端，就应该同时配置它

## 本地联调

### 对接真实 UC 后端

把 `.env` 改成真实环境：

```dotenv
EC_API_BASE_URL=https://ucapi.easecation.net
EC_ENABLE_ADMIN_TOOLS=true
EC_ENABLE_USER_TOOLS=true
EC_ADMIN_JWT_TOKEN=your-real-admin-access-token
EC_ADMIN_REFRESH_TOKEN=your-real-admin-refresh-token
EC_USER_JWT_TOKEN=your-real-user-access-token
EC_USER_REFRESH_TOKEN=your-real-user-refresh-token
MCP_TRANSPORT=stdio
```

推荐同时配置 access token 和 refresh token。当前端 JWT 只有 5 分钟有效期时，MCP 会在遇到 `401` 或 `EPF_code=8003` 时自动调用 `/user/refresh`，刷新后重试一次原请求。

## 启动

### stdio 模式

```bash
npm start
```

### Streamable HTTP 模式

```dotenv
MCP_TRANSPORT=streamable-http
MCP_HTTP_HOST=127.0.0.1
MCP_HTTP_PORT=3100
MCP_HTTP_PATH=/mcp
MCP_HTTP_BEARER_TOKEN=replace-with-a-random-secret
```

```bash
npm start
```

默认监听：

```text
http://127.0.0.1:3100/mcp
```

同时提供：

- `GET /healthz`
- `GET /`

适合反向代理、函数计算健康检查和部署后探活。

如果配置了 `MCP_HTTP_BEARER_TOKEN`，只有带 `Authorization: Bearer <token>` 或 `X-Mcp-Bearer-Token: <token>` 的请求才能访问 `POST /mcp`。`GET /healthz` 与 `GET /` 仍然保持开放，便于探活。

## Claude Desktop 配置

```json
{
  "mcpServers": {
    "ec-usercenter": {
      "command": "node",
      "args": ["/absolute/path/to/ec-usercenter-mcp-server/src/index.js"],
      "env": {
        "EC_API_BASE_URL": "http://127.0.0.1:9000",
        "EC_ENABLE_ADMIN_TOOLS": "true",
        "EC_ENABLE_USER_TOOLS": "true",
        "EC_ADMIN_JWT_TOKEN": "your-admin-access-token",
        "EC_ADMIN_REFRESH_TOKEN": "your-admin-refresh-token",
        "EC_USER_JWT_TOKEN": "your-user-access-token",
        "EC_USER_REFRESH_TOKEN": "your-user-refresh-token",
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

## 主要工具

### 用户态 `me_*`

- `me_get_current_user`
- `me_list_ecids`
- `me_get_account_overview`
- `me_get_ecid_detail`
- `me_get_binding_info`
- `me_get_email_security`
- `me_get_ticket_list`
- `me_get_ticket_count`
- `me_get_ticket_detail`
- `me_get_ticket_choices`
- `me_get_admin_recruitment_time`
- `me_search_players`
- `me_get_scoretop`
- `me_get_vip_gift_status`
- `me_get_console_player_url`
- `me_get_year_summary`
- `me_get_ticket_creation_context`
- `me_get_ecid_overview`

### 管理员态 `admin_*`

- `admin_get_current_user`
- `admin_check_staff_permission`
- `admin_query_tickets`
- `admin_get_ticket_detail`
- `admin_get_ticket_count`
- `admin_get_my_tickets`
- `admin_get_ticket_ai_reply`
- `admin_assign_ticket`
- `admin_search_players`
- `admin_get_player_basic`
- `admin_get_player_info`
- `admin_get_player_tickets`
- `admin_get_player_logs`
- `admin_get_player_bans`
- `admin_get_player_chat_history`
- `admin_get_player_auth_history`
- `admin_get_player_exchange_log`
- `admin_get_player_recording_history`
- `admin_get_player_merchandise`
- `admin_get_player_tasks`
- `admin_get_player_snapshot`

## MCP 资源

- `ec-usercenter://capabilities`

用于查看当前启用的模式、工具列表和后端地址。

## 脚本

```bash
npm test
npm run smoke
npm run fc:plan
npm run fc:deploy
npm run fc:info
npm run fc:smoke:mcp -- --url https://example.com --bearer your-shared-token
```

`npm run smoke` 适合在你已经配置好真实 `.env` 后做快速连通性探测。

## 部署

### 目标形态

仓库内置了面向阿里云 Function Compute 3.0 的 `Streamable HTTP` 部署方案：

- `s.yaml`：生产环境
- `s.playground.yaml`：playground 环境

设计上和 `easecation-user-center` 一致，走 GitHub Actions + Serverless Devs；但实现比 `user-center` 更轻，没有拆 OSS/CDN/后端三段流水线，而是单函数直发。

当前 FC 模板使用 `custom.debian10`。按阿里云官方文档要求，模板已显式把 `/var/fc/lang/nodejs20/bin` 注入 `PATH`，这样实例内可以直接执行 `npm start`。

### 本机手动部署

要求：

- 已安装并配置 `aliyun` CLI
- 有可用的阿里云 AK
- 本地 `.env` 已准备好 UC token / refresh token

安装 Serverless Devs：

```bash
npm install -g @serverless-devs/s
```

配置 access：

```bash
s config add --AccessKeyID <ak> --AccessKeySecret <sk> --region cn-hangzhou -f -a default
```

部署前建议先看计划：

```bash
npm run fc:plan
```

部署：

```bash
npm run fc:deploy
```

查看云端信息：

```bash
npm run fc:info
aliyun fc GetFunction --region cn-hangzhou --functionName ec-usercenter-mcp-server
aliyun fc ListTriggers --region cn-hangzhou --functionName ec-usercenter-mcp-server
```

如果只是验证 playground 模板：

```bash
npm run fc:plan:playground
npm run fc:deploy:playground
npm run fc:info:playground
```

如果 playground/production 部署里启用了真实 `admin_*` 或 `me_*` 工具，强烈建议同时设置 `MCP_HTTP_BEARER_TOKEN`，否则等于把带权限的 MCP 公网暴露出去。

### GitHub Actions

仓库新增了 3 条 workflow：

- `.github/workflows/quality-check.yml`
- `.github/workflows/deploy-fc.yml`
- `.github/workflows/deploy-playground-fc.yml`

其中生产和 playground 都复用：

- `.github/workflows/reusable-fc-deploy.yml`

生产环境 workflow 默认改成手动触发。和 `user-center` 不同，这个 MCP 服务会持有真实 UC token，所以不建议把 `push main` 直接绑定到生产部署。

部署 workflow 会做这些事：

1. `npm ci`
2. `npm test`
3. `s plan`
4. `s deploy`
5. `s info`
6. `aliyun fc GetFunction / ListTriggers`
7. 调用 `GET /healthz` 做远程探活
8. 调用 MCP `resources/read` / `tools/list` 做远程协议探活

### GitHub Environment / Secrets

建议在 GitHub 里创建两个 Environment：

- `production`
- `playground`

每个环境至少配置这些 secrets：

- `ALIYUN_ACCESS_KEY_ID`
- `ALIYUN_ACCESS_KEY_SECRET`
- `MCP_HTTP_BEARER_TOKEN`
- `EC_ADMIN_JWT_TOKEN` 或 `EC_ADMIN_REFRESH_TOKEN`
- `EC_USER_JWT_TOKEN` 或 `EC_USER_REFRESH_TOKEN`

可选：

- `FEISHU_WEBHOOK`

说明：

- workflow 会根据 secrets 是否存在，自动决定是否启用 `admin_*` / `me_*` 工具
- 只要启用了 `admin_*` 或 `me_*` 远程工具，workflow 会强制要求 `MCP_HTTP_BEARER_TOKEN`
- 生产 workflow 默认连 `https://ucapi.easecation.net`
- playground workflow 默认连 `http://ucapi-playground.easecation.net`
- 不要把真实 token 写进仓库文件，只放 GitHub Environment secrets 或本地 `.env`

## 设计说明

- 返回结果统一为：
  - `structuredContent`
  - `content`
- 读取类工具会带 `readOnlyHint`
- `admin_assign_ticket` 明确标记为有副作用工具
- 工具名称显式区分 `admin_*` 和 `me_*`，避免权限混淆

## 后续建议

如果你还要继续扩展个人 agent 能力，建议下一步优先补这几类聚合工具：

- `me_get_ticket_snapshot`
- `me_get_media_profile`
- `me_get_security_overview`
- `admin_get_ticket_snapshot`
