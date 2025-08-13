import { ticketAPI } from '../api/ticket-api.js';
import { handleToolError } from '../utils/errors.js';

export const ticketTools = [
  {
    name: "query_tickets",
    description: "高级工单查询，支持多条件筛选和分页",
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "number",
          description: "页码，从1开始",
          minimum: 1,
          default: 1
        },
        pageSize: {
          type: "number", 
          description: "每页大小，最大100",
          minimum: 1,
          maximum: 100,
          default: 20
        },
        tid: {
          type: "array",
          items: { type: "number" },
          description: "工单ID数组"
        },
        type: {
          type: "array",
          items: { 
            type: "string",
            enum: ["AG", "AP", "RP", "SP", "AW", "OP", "JY", "RS", "MB", "MA", "AB", "MM", "OT"]
          },
          description: "工单类型数组。AG=误判申诉, AP=申请, RP=举报玩家, SP=商品补发, AW=微信解冻, OP=玩法咨询, JY=建议, RS=举报员工, MB=媒体绑定, MA=媒体审核, AB=媒体审核, MM=媒体月报, OT=其他"
        },
        status: {
          type: "array",
          items: { type: "string" },
          description: "工单状态数组，如 ['W', 'P', 'C']"
        },
        priority: {
          type: "number",
          description: "优先级",
          minimum: 0,
          maximum: 5
        },
        initiator: {
          type: "array",
          items: { type: "string" },
          description: "发起人数组"
        },
        target: {
          type: "array", 
          items: { type: "string" },
          description: "目标数组"
        },
        advisor_uid: {
          type: "array",
          items: { type: "string" },
          description: "客服UID数组"
        }
      },
      required: ["page", "pageSize"]
    }
  },

  {
    name: "get_ticket_detail",
    description: "获取工单详细信息，包括完整历史记录",
    inputSchema: {
      type: "object",
      properties: {
        tid: {
          type: "number",
          description: "工单ID",
          minimum: 1
        },
        anonymity: {
          type: "string",
          description: "匿名访问token（可选）"
        }
      },
      required: ["tid"]
    }
  },

  {
    name: "get_ticket_list",
    description: "获取用户的工单列表（简化版）",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["AG", "AP", "RP", "SP", "AW", "OP", "JY", "RS", "MB", "MA", "AB", "MM", "OT"],
          description: "工单类型过滤"
        },
        keyword: {
          type: "string",
          description: "关键词搜索"
        }
      }
    }
  },

  {
    name: "get_ticket_count",
    description: "获取工单统计数据",
    inputSchema: {
      type: "object", 
      properties: {
        type: {
          type: "string",
          description: "统计类型"
        }
      },
      required: ["type"]
    }
  }
];

export async function handleTicketTool(name, arguments_) {
  try {
    switch (name) {
      case "query_tickets":
        const result = await ticketAPI.queryTickets(arguments_);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };

      case "get_ticket_detail":
        const detail = await ticketAPI.getTicketDetail(arguments_.tid, arguments_.anonymity);
        return {
          content: [{
            type: "text", 
            text: JSON.stringify(detail, null, 2)
          }]
        };

      case "get_ticket_list":
        const list = await ticketAPI.getTicketList(arguments_.type, arguments_.keyword);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(list, null, 2)
          }]
        };

      case "get_ticket_count":
        const count = await ticketAPI.getTicketCount(arguments_.type);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(count, null, 2)
          }]
        };

      case "get_ticket_ai_reply":
        const aiReply = await ticketAPI.getTicketAIReply(arguments_.tid, arguments_.prompt);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(aiReply, null, 2)
          }]
        };

      case "assign_ticket":
        const assigned = await ticketAPI.assignTicket(arguments_.type);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(assigned, null, 2)
          }]
        };

      default:
        throw new Error(`Unknown ticket tool: ${name}`);
    }
  } catch (error) {
    return handleToolError(error);
  }
}