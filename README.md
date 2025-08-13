# EaseCation 用户中心 MCP Server

这是一个专为 EaseCation用户中心 设计的MCP（Model Context Protocol）服务器，提供对EaseCation用户中心工单系统的只读访问能力。

## 功能特性

- **工单管理**：支持工单查询、详情获取、统计分析、AI回复建议等
- **玩家管理**：支持玩家搜索、基本信息查询、工单历史、操作日志等
- **权限管理**：支持用户信息获取和权限检查
- **只读访问**：仅提供查询类API，不包含创建、修改工单等写操作
- **管理员权限**：以管理员身份访问，可查看所有工单和玩家信息

## 安装配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量模板并填入配置信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下必需参数：

```bash
# API 基础 URL
EC_API_BASE_URL=https://ucapi.easecation.net

# 管理员 JWT Token（必需）
EC_JWT_TOKEN=your_admin_jwt_token_here

# API 超时时间（可选，默认30秒）
EC_API_TIMEOUT=30000
```

### 3. MCP 客户端配置

在使用此MCP服务器之前，需要在MCP客户端中添加服务器配置。以下是常见的配置示例：

#### Claude Desktop 配置

在 Claude Desktop 的配置文件中添加：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**方式1: 使用 npx（推荐）**
```json
{
  "mcpServers": {
    "ec-usercenter": {
      "command": "npx",
      "args": ["--registry", "https://registry.npmjs.org", "@boybook/ec-usercenter-mcp-server"],
      "env": {
        "EC_API_BASE_URL": "https://ucapi.easecation.net",
        "EC_JWT_TOKEN": "your_admin_jwt_token_here",
        "EC_API_TIMEOUT": "30000"
      }
    }
  }
}
```

**方式2: 全局安装后使用**
```json
{
  "mcpServers": {
    "ec-usercenter": {
      "command": "ec-usercenter-mcp-server",
      "env": {
        "EC_API_BASE_URL": "https://ucapi.easecation.net",
        "EC_JWT_TOKEN": "your_admin_jwt_token_here",
        "EC_API_TIMEOUT": "30000"
      }
    }
  }
}
```

#### 使用本地路径配置（开发环境）

```json
{
  "mcpServers": {
    "ec-usercenter": {
      "command": "node",
      "args": ["/path/to/ec-usercenter-mcp-server/src/index.js"],
      "env": {
        "EC_API_BASE_URL": "https://ucapi.easecation.net",
        "EC_JWT_TOKEN": "your_admin_jwt_token_here",
        "EC_API_TIMEOUT": "30000"
      }
    }
  }
}
```

#### 通用 MCP 客户端配置

```json
{
  "name": "ec-usercenter",
  "command": "npx",
  "args": ["@boybook/ec-usercenter-mcp-server"],
  "env": {
    "EC_API_BASE_URL": "https://ucapi.easecation.net", 
    "EC_JWT_TOKEN": "your_admin_jwt_token_here"
  }
}
```

### 4. 安装和使用

#### 从 npm 安装（推荐）

```bash
# 方式1: 使用官方npm源安装（推荐）
npm install -g @boybook/ec-usercenter-mcp-server --registry https://registry.npmjs.org

# 或者直接使用 npx
npx @boybook/ec-usercenter-mcp-server --registry https://registry.npmjs.org

# 方式2: 如果使用中国镜像，需要等待同步（通常几小时内）
npm install -g @boybook/ec-usercenter-mcp-server

# 全局安装后直接使用命令
ec-usercenter-mcp-server
```

#### 本地开发

独立启动（用于调试）：

```bash
npm start
```

或者开发模式（自动重启）：

```bash
npm run dev
```

#### 本地开发测试

确保npx入口工作正常：

```bash
# 在项目根目录下
npm link
npx ec-usercenter-mcp-server
```

#### 验证发布

```bash
# 检查包信息
npm view @boybook/ec-usercenter-mcp-server

# 直接运行（npm可能需要几分钟同步）
npx @boybook/ec-usercenter-mcp-server
```

## 可用工具

### 工单管理工具 (6个)

1. **query_tickets** - 高级工单查询
   - 支持分页、多条件筛选
   - 参数：page, pageSize, tid[], type[], status[], priority, initiator[], target[], advisor_uid[]

2. **get_ticket_detail** - 获取工单详情
   - 包含完整历史记录
   - 参数：tid (必需), anonymity (可选)

3. **get_ticket_list** - 获取工单列表
   - 简化版工单列表
   - 参数：type (可选), keyword (可选)

4. **get_ticket_count** - 获取工单统计
   - 各类工单数量统计
   - 参数：type (必需)

5. **get_ticket_ai_reply** - 获取AI回复建议
   - 为指定工单生成回复建议
   - 参数：tid (必需), prompt (可选)

6. **assign_ticket** - 分配工单
   - 获取待处理工单进行分配
   - 参数：type ('my'|'upgrade'|'unassigned')

### 玩家管理工具 (5个)

7. **search_players** - 搜索玩家
   - 根据玩家名称搜索
   - 参数：name (必需)

8. **get_player_basic** - 获取玩家基本信息
   - 包含等级、金币、经验等
   - 参数：ecid (必需)

9. **get_player_tickets** - 获取玩家工单历史
   - 玩家相关的所有工单
   - 参数：ecid (必需)

10. **get_player_logs** - 获取玩家操作历史
    - 对玩家的管理操作记录
    - 参数：ecid (必需)

11. **get_player_bans** - 获取玩家处罚历史
    - 封禁、禁言等处罚记录
    - 参数：ecid (必需)

### 认证管理工具 (2个)

12. **get_user_info** - 获取用户信息
    - 当前Token对应的用户信息和权限
    - 无参数

13. **check_staff_permission** - 检查管理员权限
    - 验证管理员权限
    - 参数：authorizer (必需)

## 工单类型说明

- **AG**: 误判申诉
- **AP**: 申请
- **RP**: 举报玩家
- **SP**: 商品补发
- **AW**: 微信解冻
- **OP**: 玩法咨询
- **JY**: 建议
- **RS**: 举报员工
- **MB**: 媒体绑定
- **MA**: 媒体审核
- **AB**: 媒体审核
- **MM**: 媒体月报
- **OT**: 其他

## 故障排除

### npm包安装问题

如果遇到 `404 Not Found` 错误，通常是由于使用了npm镜像源且包还未同步。

**解决方案：**

1. **使用官方npm源**（推荐）：
   ```bash
   npm install -g @boybook/ec-usercenter-mcp-server --registry https://registry.npmjs.org
   npx @boybook/ec-usercenter-mcp-server --registry https://registry.npmjs.org
   ```

2. **等待镜像同步**：中国镜像通常在几小时内同步

3. **检查npm配置**：
   ```bash
   npm config get registry
   # 如需临时切换到官方源
   npm config set registry https://registry.npmjs.org
   ```

### MCP配置问题

- 确保环境变量 `EC_JWT_TOKEN` 和 `EC_API_BASE_URL` 已正确设置
- 检查Claude Desktop配置文件路径是否正确
- 重启Claude Desktop后配置才会生效

## 错误处理

服务器会处理以下类型的错误：

- **配置错误**: JWT Token 或 API URL 缺失
- **API错误**: 网络请求失败、权限不足等
- **参数验证错误**: 必需参数缺失、类型不匹配等

错误信息会以标准MCP格式返回，包含详细的错误描述。

## 开发说明

### 项目结构

```
src/
├── index.js                    # MCP server 入口点
├── config.js                  # 环境变量配置管理
├── api/
│   ├── client.js              # HTTP API 客户端封装
│   ├── ticket-api.js          # 工单相关 API 调用
│   ├── player-api.js          # 玩家相关 API 调用
│   └── auth-api.js            # 认证相关 API 调用
├── tools/
│   ├── ticket-tools.js        # 工单相关 MCP tools
│   ├── player-tools.js        # 玩家相关 MCP tools
│   └── auth-tools.js          # 认证相关 MCP tools
└── utils/
    ├── validators.js          # 参数验证工具
    └── errors.js              # 错误处理工具
```

### 技术栈

- **Node.js 18+**: 运行环境
- **@modelcontextprotocol/sdk**: MCP 服务器框架
- **fetch API**: HTTP 请求（Node.js 原生）
- **ES Modules**: 模块系统

## 许可证

MIT License