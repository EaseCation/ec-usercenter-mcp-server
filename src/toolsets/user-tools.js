import { z } from "zod";
import { ReadOnlyAnnotations, ResultEnvelopeShape, booleanLikeSchema, createStructuredResult } from "./shared.js";

function createUserReadTool(definition) {
  return {
    ...definition,
    mode: "user",
    outputSchema: ResultEnvelopeShape,
    annotations: {
      ...ReadOnlyAnnotations,
      ...definition.annotations,
    },
  };
}

export const userTools = [
  createUserReadTool({
    name: "me_get_current_user",
    title: "当前用户信息",
    description: "读取当前用户 token 对应的用户资料。",
    inputSchema: {},
    endpoint: "/user/info",
    handler: api => api.get("/user/info"),
  }),
  createUserReadTool({
    name: "me_list_ecids",
    title: "我的 ECID 列表",
    description: "列出当前用户已绑定的所有 ECID。",
    inputSchema: {},
    endpoint: "/ec/list",
    handler: api => api.get("/ec/list"),
  }),
  createUserReadTool({
    name: "me_get_account_overview",
    title: "我的账号概览",
    description: "聚合当前用户信息和已绑定 ECID 列表，适合个人 agent 做启动上下文。",
    inputSchema: {},
    endpoint: "composed:/user/info+/ec/list",
    handler: async api => {
      const [user, ecids] = await Promise.all([api.get("/user/info"), api.get("/ec/list")]);
      return { user, ecids };
    },
    resultSummary: () => "已聚合当前用户信息与绑定 ECID 列表。",
  }),
  createUserReadTool({
    name: "me_get_ecid_detail",
    title: "我的 ECID 详情",
    description: "读取当前用户名下指定 ECID 的详细信息。",
    inputSchema: {
      ecid: z.string().min(1).describe("本人已绑定的 ECID"),
    },
    endpoint: "/ec/detail",
    handler: (api, args) => api.get("/ec/detail", args),
  }),
  createUserReadTool({
    name: "me_get_binding_info",
    title: "我的账号绑定信息",
    description: "读取指定 ECID 的跨平台绑定信息。",
    inputSchema: {
      ecid: z.string().min(1).describe("本人已绑定的 ECID"),
    },
    endpoint: "/ec/binding-info",
    handler: (api, args) => api.get("/ec/binding-info", args),
  }),
  createUserReadTool({
    name: "me_get_email_security",
    title: "我的密保邮箱设置",
    description: "读取指定 ECID 的密保邮箱开关状态。",
    inputSchema: {
      ecid: z.string().min(1).describe("本人已绑定的 ECID"),
    },
    endpoint: "/user/email-security",
    handler: (api, args) => api.get("/user/email-security", args),
  }),
  createUserReadTool({
    name: "me_get_ticket_choices",
    title: "可创建工单类型",
    description: "读取当前用户在指定基础类型下可创建的工单选项。",
    inputSchema: {
      type: z.string().min(1).describe("基础工单类型"),
    },
    endpoint: "/ticket/chooseList",
    handler: (api, args) => api.get("/ticket/chooseList", args),
  }),
  createUserReadTool({
    name: "me_get_admin_recruitment_time",
    title: "管理员招新时间",
    description: "读取当前管理员招新的开放时间窗口。",
    inputSchema: {},
    endpoint: "/ticket/adminRecruitmentTime",
    handler: api => api.get("/ticket/adminRecruitmentTime"),
  }),
  createUserReadTool({
    name: "me_get_ticket_list",
    title: "我的工单列表",
    description: "读取当前用户自己的工单列表。",
    inputSchema: {
      type: z.string().optional().describe("工单类型，可选"),
      keyword: z.string().optional().describe("搜索关键词，可选"),
    },
    endpoint: "/ticket/list",
    handler: (api, args) => api.get("/ticket/list", args),
  }),
  createUserReadTool({
    name: "me_get_ticket_count",
    title: "我的工单统计",
    description: "读取当前用户自己的工单计数。",
    inputSchema: {
      type: z.string().min(1).describe("统计类型"),
    },
    endpoint: "/ticket/count",
    handler: (api, args) => api.get("/ticket/count", args),
  }),
  createUserReadTool({
    name: "me_get_ticket_detail",
    title: "我的工单详情",
    description: "读取当前用户可访问的工单详情。",
    inputSchema: {
      tid: z.coerce.number().int().positive().describe("工单 ID"),
      token: z.string().optional().describe("匿名分享 token，可选"),
    },
    endpoint: "/ticket/detail",
    handler: (api, args) => api.get("/ticket/detail", args),
  }),
  createUserReadTool({
    name: "me_search_players",
    title: "搜索玩家",
    description: "按昵称或 ECID 搜索公开可见的玩家账号。",
    inputSchema: {
      name: z.string().min(1).describe("玩家昵称或 ECID 关键词"),
    },
    endpoint: "/ec/search",
    handler: (api, args) => api.get("/ec/search", { name: args.name, keyword: args.name }),
  }),
  createUserReadTool({
    name: "me_get_scoretop",
    title: "排行榜信息",
    description: "读取指定游戏或游戏组的排行榜数据。",
    inputSchema: {
      game: z.union([z.string(), z.array(z.string())]).optional().describe("游戏标识，支持单个或多个"),
    },
    endpoint: "/ec/scoretop",
    handler: (api, args) => api.get("/ec/scoretop", args),
  }),
  createUserReadTool({
    name: "me_get_vip_gift_status",
    title: "VIP 赠送资格",
    description: "读取当前用户对指定 ECID 的 VIP 赠送资格和剩余次数。",
    inputSchema: {
      ecid: z.string().min(1).describe("本人已绑定的 ECID"),
    },
    endpoint: "/ec/gift",
    handler: (api, args) => api.get("/ec/gift", args),
  }),
  createUserReadTool({
    name: "me_get_console_player_url",
    title: "Console 玩家页链接",
    description: "根据 ECID 获取 console 玩家页跳转链接，便于 agent 给出可点击入口。",
    inputSchema: {
      ecid: z.string().min(1).describe("本人已绑定的 ECID"),
    },
    endpoint: "/user/console-player-url",
    handler: (api, args) => api.get("/user/console-player-url", args),
  }),
  createUserReadTool({
    name: "me_get_year_summary",
    title: "我的年度总结",
    description: "读取当前用户指定 ECID 的年度总结数据。",
    inputSchema: {
      ecid: z.string().min(1).describe("本人已绑定的 ECID"),
      type: z
        .enum([
          "basic-info",
          "login-stats",
          "game-stats",
          "rank-data",
          "currency-data",
          "social-data",
          "ticket-stats",
          "ai-evaluation",
          "calculate-title",
          "all",
        ])
        .default("all")
        .describe("总结数据类型"),
      year: z.coerce.number().int().optional().describe("年度周期对应的起始年份"),
    },
    endpoint: "/year-summary",
    handler: (api, args) => api.get("/year-summary", args),
  }),
  createUserReadTool({
    name: "me_get_ticket_creation_context",
    title: "工单创建上下文",
    description:
      "聚合用户可创建的工单类型、管理员招新时间、绑定 ECID 列表，并可选附带指定 ECID 的赠送资格，适合个人 agent 在发起工单前做准备。",
    inputSchema: {
      type: z.string().min(1).describe("基础工单类型"),
      ecid: z.string().optional().describe("可选，若提供则附带该 ECID 的 VIP 赠送资格"),
    },
    endpoint: "composed:/ticket/chooseList+/ticket/adminRecruitmentTime+/ec/list+/ec/gift",
    handler: async (api, args) => {
      const [choices, recruitmentTime, ecids] = await Promise.all([
        api.get("/ticket/chooseList", { type: args.type }),
        api.get("/ticket/adminRecruitmentTime"),
        api.get("/ec/list"),
      ]);

      const result = {
        type: args.type,
        choices,
        recruitmentTime,
        ecids,
      };

      if (args.ecid) {
        result.vipGiftStatus = await api.get("/ec/gift", { ecid: args.ecid });
      }

      return result;
    },
    resultSummary: args => `已聚合 ${args.type} 的工单创建上下文。`,
  }),
  createUserReadTool({
    name: "me_get_ecid_overview",
    title: "我的 ECID 全景视图",
    description:
      "聚合 ECID 详情、绑定信息、密保邮箱设置，并可选带上年度总结，适合个人 agent 做账号画像。",
    inputSchema: {
      ecid: z.string().min(1).describe("本人已绑定的 ECID"),
      includeYearSummary: booleanLikeSchema.default(false).describe("是否附带年度总结"),
      year: z.coerce.number().int().optional().describe("年度周期对应的起始年份"),
    },
    endpoint: "composed:/ec/detail+/ec/binding-info+/user/email-security+/year-summary",
    handler: async (api, args) => {
      const [detail, bindingInfo, emailSecurity] = await Promise.all([
        api.get("/ec/detail", { ecid: args.ecid }),
        api.get("/ec/binding-info", { ecid: args.ecid }),
        api.get("/user/email-security", { ecid: args.ecid }),
      ]);

      const result = {
        ecid: args.ecid,
        detail,
        bindingInfo,
        emailSecurity,
      };

      if (args.includeYearSummary) {
        result.yearSummary = await api.get("/year-summary", {
          ecid: args.ecid,
          type: "all",
          year: args.year,
        });
      }

      return result;
    },
    resultSummary: args => `已聚合 ${args.ecid} 的个人账号画像。`,
  }),
].map(tool => ({
  ...tool,
  run: async (api, args = {}) =>
    createStructuredResult({
      mode: "user",
      endpoint: tool.endpoint,
      data: await tool.handler(api, args),
      summary: tool.resultSummary?.(args),
    }),
}));
