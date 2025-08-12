# 工单小助手AI - API文档

## 系统概述

EaseCation用户中心后端是一个基于Express.js的Node.js应用，主要为游戏服务器和用户提供工单管理、用户认证、玩家管理等功能。本文档重点介绍适合工单小助手AI调用的核心API。

## 身份认证流程

### JWT Token认证机制

系统使用JWT (JSON Web Token) 进行身份认证，所有需要认证的API都需要在HTTP请求头中携带Token。

#### Token格式
```
Authorization: Bearer <JWT_TOKEN>
```

#### JWT Payload结构
```typescript
{
  iss: string;        // 发行人
  aud: string;        // 受众
  iat: string;        // 签发时间
  nbt: string;        // 生效时间
  exp: string;        // 过期时间
  openid: string;     // openid（所有情况都有）
  userid?: string;    // 用户ID，仅管理员有
  permissions?: string[]; // 权限列表
}
```

#### 权限等级
- **普通用户**: 只有 `openid`，可以创建和查看自己的工单
- **管理员**: 具有 `userid`，可以处理所有工单和执行管理操作

### 登录API

#### GET /user/login
**功能**: 通过授权码登录获取JWT Token

**请求参数**:
- `code` (string, required): 授权码

**响应**: 重定向到前端页面，URL中包含token参数

**示例**:
```
GET /user/login?code=AUTH_CODE_HERE
```

#### GET /user/info
**功能**: 获取当前登录用户信息

**权限**: 需要JWT Token

**响应**:
```json
{
  "EPF": 200,
  "openid": "user_openid",
  "userid": "admin_userid", // 仅管理员有
  "permissions": ["permission1", "permission2"] // 权限列表
}
```

---

## 工单管理API

### 1. 创建工单

#### POST /ticket/new
**功能**: 创建新的工单

**权限**: 需要JWT Token

**请求参数**:
```json
{
  "type": "string",              // 工单类型 (required)
  "account": "string",           // 账号 (optional)
  "target": "string",            // 目标 (optional)
  "title": "string",             // 标题 (optional)
  "details": "string",           // 详情 (optional)
  "happened_at_date": "string",  // 发生日期 (optional)
  "happened_at_time": "string",  // 发生时间 (optional)
  "files": ["string"]            // 附件文件 (optional)
}
```

**工单类型枚举**:
- `AG`: 误判申诉
- `AP`: 申请
- `RP`: 举报玩家
- `SP`: 商品补发
- `AW`: 微信解冻
- `OP`: 玩法咨询
- `JY`: 建议
- `RS`: 举报员工
- `MB`: 媒体绑定
- `MA`: 媒体审核
- `AB`: 媒体审核
- `MM`: 媒体月报
- `OT`: 其他

**响应**:
```json
{
  "EPF": 200,
  "tid": 12345
}
```

### 2. 查询工单列表

#### GET /ticket/list
**功能**: 获取用户的工单列表

**权限**: 需要JWT Token

**请求参数**:
- `type` (string, optional): 工单类型过滤
- `keyword` (string, optional): 关键词搜索

**响应**: 返回工单数组
```json
[
  {
    "tid": 12345,
    "status": "W",
    "type": "RP",
    "title": "工单标题",
    "priority": 1
  }
]
```

### 3. 高级工单查询 (管理员)

#### GET /ticket/query
**功能**: 高级工单查询，支持多条件筛选

**权限**: 需要管理员JWT Token

**请求参数**:
- `page` (number, required): 页码
- `pageSize` (number, required): 每页大小
- `tid` (number[], optional): 工单ID数组
- `type` (string[], optional): 工单类型数组
- `status` (string[], optional): 状态数组
- `priority` (number, optional): 优先级
- `initiator` (string[], optional): 发起人数组
- `target` (string[], optional): 目标数组
- `advisor_uid` (string[], optional): 客服UID数组

**响应**:
```json
{
  "EPF": 200,
  "result": [
    {
      "tid": 12345,
      "priority": 1,
      "type": "RP",
      "title": "工单标题",
      "creator_openid": "openid",
      "initiator": "发起人",
      "target": "目标",
      "status": "W",
      "create_time": "2024-01-01 12:00:00",
      "advisor_uid": "客服ID"
    }
  ],
  "hasMore": true
}
```

### 4. 工单详情

#### GET /ticket/detail
**功能**: 获取工单详细信息

**权限**: 需要JWT Token

**请求参数**:
- `tid` (number, required): 工单ID
- `anonymity` (string, optional): 匿名访问token

**响应**:
```json
{
  "EPF": 200,
  "tid": 12345,
  "title": "工单标题",
  "type": "RP",
  "status": "W",
  "priority": 1,
  "create_time": "2024-01-01 12:00:00",
  "details": [
    {
      "tid": 12345,
      "displayTitle": "显示标题",
      "action": "R",
      "operator": "操作者",
      "content": "回复内容",
      "attachments": ["file1.jpg"],
      "create_time": "2024-01-01 12:00:00",
      "isOfficial": true
    }
  ]
}
```

### 5. 工单回复

#### POST /ticket/action
**功能**: 对工单进行回复

**权限**: 需要JWT Token

**请求参数**:
```json
{
  "tid": 12345,
  "details": "回复内容",
  "files": ["file1.jpg", "file2.png"]
}
```

**响应**:
```json
{
  "EPF": 200
}
```

### 6. 工单管理操作 (管理员)

#### POST /ticket/admin
**功能**: 管理员对工单执行管理操作

**权限**: 需要管理员JWT Token

**请求参数**:
```json
{
  "tid": 12345,
  "action": "R",               // 操作类型: R=回复, N=备注, U=升级, D=分配
  "details": "操作内容",
  "files": ["file1.jpg"]       // 可选的附件
}
```

**响应**:
```json
{
  "EPF": 200
}
```

### 7. 工单统计

#### GET /ticket/count
**功能**: 获取工单统计数据

**权限**: 需要JWT Token

**请求参数**:
- `type` (string, required): 统计类型

**响应**:
```json
{
  "EPF": 200,
  "count_waiting_total": 100,
  "count_waiting_unassigned": 50,
  "count_waiting_assigned": 50,
  "next_tid_vip": 12345,
  "next_tid_normal": 12346,
  "count_waiting_my": {
    "my": 10,
    "unassigned": 20,
    "upgrade": 5
  }
}
```

### 8. 分配工单 (管理员)

#### GET /ticket/assign
**功能**: 管理员分配待处理工单

**权限**: 需要管理员JWT Token

**请求参数**:
- `type` (string, required): 分配类型 ('my' | 'upgrade' | 'unassigned')

**响应**:
```json
{
  "EPF": 200,
  "tid": 12345
}
```

### 9. 取消工单

#### GET /ticket/drop
**功能**: 用户取消自己的工单

**权限**: 需要JWT Token

**请求参数**:
- `tid` (number, required): 工单ID

**响应**:
```json
{
  "EPF": 200
}
```

### 10. AI回复功能 (管理员)

#### GET /ticket/aiReply
**功能**: 为工单生成AI回复建议

**权限**: 需要管理员JWT Token

**请求参数**:
- `tid` (number, required): 工单ID
- `prompt` (string, optional): 自定义提示词

**响应**:
```json
{
  "EPF": 200,
  "reply": "AI生成的回复内容"
}
```

---

## 玩家管理API

### 1. 搜索玩家

#### GET /ec/search
**功能**: 根据玩家名称搜索玩家

**权限**: 需要JWT Token

**请求参数**:
- `name` (string, required): 玩家名称

**响应**:
```json
{
  "EPF": 200,
  "players": [
    {
      "ecid": "player_ecid",
      "name": "玩家名称",
      "level": 10
    }
  ]
}
```

### 2. 玩家基本信息 (管理员)

#### GET /ec/basic
**功能**: 获取玩家基本信息

**权限**: 需要管理员JWT Token

**请求参数**:
- `ecid` (string, required): 玩家ECID

**响应**:
```json
{
  "EPF": 200,
  "ecid": "player_ecid",
  "name": "玩家名称",
  "level": 10,
  "coins": 1000,
  "experience": 50000
}
```

### 3. 玩家工单历史 (管理员)

#### GET /ec/tickets
**功能**: 获取玩家相关的工单列表

**权限**: 需要管理员JWT Token

**请求参数**:
- `ecid` (string, required): 玩家ECID

**响应**:
```json
{
  "EPF": 200,
  "tickets": [
    {
      "tid": 12345,
      "type": "RP",
      "title": "工单标题",
      "status": "W",
      "create_time": "2024-01-01 12:00:00"
    }
  ]
}
```

### 4. 玩家操作历史 (管理员)

#### GET /ec/ticket-logs
**功能**: 获取对玩家的操作日志

**权限**: 需要管理员JWT Token

**请求参数**:
- `ecid` (string, required): 玩家ECID

**响应**:
```json
{
  "EPF": 200,
  "logs": [
    {
      "log_id": 1,
      "uid": 123,
      "target": "player_ecid",
      "action": [
        {
          "type": "ban",
          "data": "3天",
          "reason": "违规行为"
        }
      ],
      "create_time": "2024-01-01 12:00:00",
      "authorizer": "管理员"
    }
  ]
}
```

### 5. 玩家处罚历史 (管理员)

#### GET /ec/ban
**功能**: 获取玩家封禁历史

**权限**: 需要管理员JWT Token

**请求参数**:
- `ecid` (string, required): 玩家ECID

**响应**:
```json
{
  "EPF": 200,
  "bans": [
    {
      "ban_id": 1,
      "reason": "违规行为",
      "start_time": "2024-01-01 12:00:00",
      "end_time": "2024-01-04 12:00:00",
      "operator": "管理员"
    }
  ]
}
```

### 6. 玩家操作执行 (管理员)

#### POST /ec/action
**功能**: 对玩家执行管理操作

**权限**: 需要管理员JWT Token

**请求参数**:
```json
{
  "ecid": "player_ecid",
  "action": "ban",              // 操作类型
  "value": "3天",               // 操作值 (optional)
  "reason": "违规原因",          // 原因 (optional)
  "toUser": true,               // 是否通知用户 (optional)
  "authorizer": "管理员名称",    // 授权人 (optional)
  "tid": 12345                  // 关联工单 (optional)
}
```

**常见操作类型**:
- `ban`: 封禁
- `unban`: 解封
- `mute`: 禁言
- `unmute`: 解除禁言
- `kick`: 踢出
- `warn`: 警告

**响应**:
```json
{
  "EPF": 200
}
```

---

## 权限管理API

### 1. 权限检查 (管理员)

#### GET /staff/permission
**功能**: 检查管理员权限

**权限**: 需要管理员JWT Token

**请求参数**:
- `authorizer` (string, required): 授权人标识

**响应**:
```json
{
  "EPF": 200,
  "hasPermission": true,
  "permissions": ["permission1", "permission2"]
}
```

---

## 错误码说明

### EPF响应码
- `200`: 成功
- `400`: 请求参数错误
- `401`: 缺少Token
- `403`: Token无效或权限不足
- `404`: 页面不存在
- `500`: 服务器内部错误

### 特殊业务错误码
- `NoBindingECID`: 用户未绑定游戏账号
- `InvalidToken`: Token无效
- `MissingToken`: 缺少Token
- `InsufficientTokenPermission`: Token权限不足

---

## 工单小助手AI使用建议

### 1. 认证流程
1. 工单小助手AI需要获取管理员级别的JWT Token
2. 在所有API请求中携带Token进行身份验证

### 2. 核心功能API优先级

#### 高优先级 (核心功能)
1. `GET /ticket/query` - 工单查询和筛选
2. `GET /ticket/detail` - 工单详情查看
3. `POST /ticket/admin` - 工单处理和回复
4. `GET /ticket/assign` - 自动分配工单
5. `GET /ticket/aiReply` - AI回复建议

#### 中优先级 (辅助功能)
1. `GET /ec/search` - 玩家搜索
2. `GET /ec/basic` - 玩家信息查询
3. `GET /ec/tickets` - 玩家工单历史
4. `POST /ec/action` - 玩家管理操作

#### 低优先级 (统计功能)
1. `GET /ticket/count` - 工单统计
2. `GET /ec/ban` - 处罚历史查询

### 3. 自动化场景
- **工单分配**: 使用 `/ticket/assign` 自动获取待处理工单
- **批量处理**: 使用 `/ticket/query` 批量查询特定条件的工单
- **智能回复**: 结合 `/ticket/detail` 和 `/ticket/aiReply` 提供智能回复建议
- **玩家管理**: 通过 `/ec/search` 和 `/ec/action` 实现玩家管理自动化

### 4. 注意事项
- 所有修改操作都会记录操作日志
- 敏感操作需要提供 `authorizer` 参数
- 文件上传需要先处理文件存储，再在API中传递文件路径
- 工单状态变更会影响统计数据，需要及时同步