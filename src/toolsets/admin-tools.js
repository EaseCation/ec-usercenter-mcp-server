import { z } from "zod";
import {
  ActionAnnotations,
  ReadOnlyAnnotations,
  ResultEnvelopeShape,
  booleanLikeSchema,
  createStructuredResult,
} from "./shared.js";

const pageSchema = z.coerce.number().int().min(1).default(1).describe("页码，从 1 开始");
const pageSizeSchema = z.coerce.number().int().min(1).max(100).default(20).describe("每页数量，最大 100");

function createAdminReadTool(definition) {
  return {
    ...definition,
    mode: "admin",
    outputSchema: ResultEnvelopeShape,
    annotations: {
      ...ReadOnlyAnnotations,
      ...definition.annotations,
    },
  };
}

function createAdminActionTool(definition) {
  return {
    ...definition,
    mode: "admin",
    outputSchema: ResultEnvelopeShape,
    annotations: {
      ...ActionAnnotations,
      ...definition.annotations,
    },
  };
}

export const adminTools = [
  createAdminReadTool({
    name: "admin_get_current_user",
    title: "当前管理员信息",
    description: "读取当前管理员 token 对应的用户资料与权限。",
    inputSchema: {},
    endpoint: "/user/info",
    handler: api => api.get("/user/info"),
  }),
  createAdminReadTool({
    name: "admin_check_staff_permission",
    title: "检查员工权限",
    description: "检查指定 authorizer 的员工权限结果。",
    inputSchema: {
      authorizer: z.string().min(1).describe("授权人标识"),
    },
    endpoint: "/staff/permission",
    handler: (api, args) => api.get("/staff/permission", args),
  }),
  createAdminReadTool({
    name: "admin_query_tickets",
    title: "高级工单查询",
    description: "管理员高级查询非媒体工单，支持分页、多条件筛选和关键词搜索。",
    inputSchema: {
      page: pageSchema,
      pageSize: pageSizeSchema,
      tid: z.array(z.coerce.number().int().positive()).optional().describe("工单 ID 数组"),
      type: z.array(z.string()).optional().describe("工单类型数组"),
      status: z.array(z.string()).optional().describe("工单状态数组"),
      priority: z.coerce.number().int().optional().describe("优先级"),
      initiator: z.array(z.string()).optional().describe("发起人数组"),
      target: z.array(z.string()).optional().describe("目标数组"),
      advisor_uid: z.array(z.string()).optional().describe("客服 UID 数组"),
      searchKeyword: z.string().optional().describe("按标题或详情搜索的关键词"),
      searchTitle: booleanLikeSchema.optional().describe("是否搜索标题"),
      searchDetails: booleanLikeSchema.optional().describe("是否搜索详情"),
      useRegex: booleanLikeSchema.optional().describe("是否使用正则搜索"),
    },
    endpoint: "/ticket/query",
    handler: (api, args) => api.get("/ticket/query", args),
  }),
  createAdminReadTool({
    name: "admin_get_ticket_detail",
    title: "工单详情",
    description: "获取指定工单的完整详情与处理历史。",
    inputSchema: {
      tid: z.coerce.number().int().positive().describe("工单 ID"),
      token: z.string().optional().describe("匿名分享 token，可选"),
    },
    endpoint: "/ticket/detail",
    handler: (api, args) => api.get("/ticket/detail", args),
  }),
  createAdminReadTool({
    name: "admin_get_ticket_count",
    title: "当前工单计数",
    description: "读取当前管理员 token 下可见的工单统计。",
    inputSchema: {
      type: z.string().min(1).describe("统计类型"),
    },
    endpoint: "/ticket/count",
    handler: (api, args) => api.get("/ticket/count", args),
  }),
  createAdminReadTool({
    name: "admin_get_my_tickets",
    title: "我的管理员队列",
    description: "读取当前管理员正在处理的工单列表。",
    inputSchema: {},
    endpoint: "/ticket/adminMy",
    handler: api => api.get("/ticket/adminMy"),
  }),
  createAdminReadTool({
    name: "admin_get_ticket_ai_reply",
    title: "AI 工单回复建议",
    description: "为指定工单读取 AI 回复建议，不会实际发送回复。",
    inputSchema: {
      tid: z.coerce.number().int().positive().describe("工单 ID"),
      prompt: z.string().optional().describe("额外提示词"),
    },
    endpoint: "/ticket/aiReply",
    handler: (api, args) => api.get("/ticket/aiReply", args),
  }),
  createAdminActionTool({
    name: "admin_assign_ticket",
    title: "分配工单",
    description: "从指定队列中实际分配一张工单给当前管理员。这是有副作用的操作。",
    inputSchema: {
      type: z.string().min(1).describe("队列类型，例如 my / upgrade / unassigned"),
    },
    endpoint: "/ticket/assign",
    handler: (api, args) => api.get("/ticket/assign", args),
  }),
  createAdminReadTool({
    name: "admin_search_players",
    title: "搜索玩家",
    description: "按玩家昵称或 ECID 搜索玩家。",
    inputSchema: {
      name: z.string().min(1).describe("玩家昵称或 ECID 关键词"),
    },
    endpoint: "/ec/search",
    handler: (api, args) => api.get("/ec/search", { name: args.name, keyword: args.name }),
  }),
  createAdminReadTool({
    name: "admin_get_player_basic",
    title: "玩家基础信息",
    description: "读取指定玩家的基础资料、等级、货币与绑定摘要。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/basic",
    handler: (api, args) => api.get("/ec/basic", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_info",
    title: "玩家完整信息",
    description: "读取指定玩家的完整玩家信息。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/info",
    handler: (api, args) => api.get("/ec/info", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_tickets",
    title: "玩家工单历史",
    description: "读取指定玩家相关的工单历史。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/tickets",
    handler: (api, args) => api.get("/ec/tickets", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_logs",
    title: "玩家操作日志",
    description: "读取指定玩家的工单处理日志。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/ticket-logs",
    handler: (api, args) => api.get("/ec/ticket-logs", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_bans",
    title: "玩家处罚历史",
    description: "读取指定玩家的封禁处罚记录。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/ban",
    handler: (api, args) => api.get("/ec/ban", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_chat_history",
    title: "玩家聊天记录",
    description: "读取指定玩家的聊天历史。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/chat",
    handler: (api, args) => api.get("/ec/chat", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_auth_history",
    title: "玩家认证历史",
    description: "读取指定玩家的认证历史记录。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/auth",
    handler: (api, args) => api.get("/ec/auth", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_exchange_log",
    title: "玩家兑换记录",
    description: "读取指定玩家的兑换、购买或交易记录。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
      from: z.string().optional().describe("开始时间，例如 2026-01-01 00:00:00"),
      to: z.string().optional().describe("结束时间，例如 2026-01-31 23:59:59"),
    },
    endpoint: "/ec/exchange",
    handler: (api, args) => api.get("/ec/exchange", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_recording_history",
    title: "玩家录像历史",
    description: "读取指定玩家的录像历史。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
      startTime: z.string().optional().describe("开始日期，例如 2026-01-01"),
      endTime: z.string().optional().describe("结束日期，例如 2026-01-31"),
    },
    endpoint: "/ec/recording",
    handler: (api, args) => api.get("/ec/recording", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_merchandise",
    title: "玩家商品数据",
    description: "读取指定玩家的商城商品数据。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/merchandise",
    handler: (api, args) => api.get("/ec/merchandise", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_tasks",
    title: "玩家任务数据",
    description: "读取指定玩家的任务数据。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "/ec/tasks",
    handler: (api, args) => api.get("/ec/tasks", args),
  }),
  createAdminReadTool({
    name: "admin_get_player_snapshot",
    title: "玩家快照",
    description: "一次性拉取玩家基础信息、完整信息、工单、处罚与日志，适合排查场景。",
    inputSchema: {
      ecid: z.string().min(1).describe("玩家 ECID"),
    },
    endpoint: "composed:/ec/*",
    handler: async (api, args) => {
      const [basic, info, tickets, bans, logs] = await Promise.all([
        api.get("/ec/basic", args),
        api.get("/ec/info", args),
        api.get("/ec/tickets", args),
        api.get("/ec/ban", args),
        api.get("/ec/ticket-logs", args),
      ]);

      return {
        ecid: args.ecid,
        basic,
        info,
        tickets,
        bans,
        logs,
      };
    },
    resultSummary: args => `已聚合管理员视角下 ${args.ecid} 的玩家快照。`,
  }),
].map(tool => ({
  ...tool,
  run: async (api, args = {}) =>
    createStructuredResult({
      mode: "admin",
      endpoint: tool.endpoint,
      data: await tool.handler(api, args),
      summary: tool.resultSummary?.(args),
    }),
}));
