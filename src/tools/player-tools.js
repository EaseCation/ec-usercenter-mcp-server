import { playerAPI } from '../api/player-api.js';
import { handleToolError } from '../utils/errors.js';

export const playerTools = [
  {
    name: "search_players",
    description: "根据玩家名称搜索玩家",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "玩家名称",
          minLength: 1
        }
      },
      required: ["name"]
    }
  },

  {
    name: "get_player_basic",
    description: "获取玩家基本信息（需要管理员权限）",
    inputSchema: {
      type: "object",
      properties: {
        ecid: {
          type: "string",
          description: "玩家ECID",
          minLength: 1
        }
      },
      required: ["ecid"]
    }
  },

  {
    name: "get_player_tickets",
    description: "获取玩家相关的工单历史（需要管理员权限）",
    inputSchema: {
      type: "object",
      properties: {
        ecid: {
          type: "string",
          description: "玩家ECID",
          minLength: 1
        }
      },
      required: ["ecid"]
    }
  },

  {
    name: "get_player_logs",
    description: "获取对玩家的操作日志历史（需要管理员权限）",
    inputSchema: {
      type: "object",
      properties: {
        ecid: {
          type: "string",
          description: "玩家ECID",
          minLength: 1
        }
      },
      required: ["ecid"]
    }
  },

  {
    name: "get_player_bans",
    description: "获取玩家封禁处罚历史（需要管理员权限）",
    inputSchema: {
      type: "object",
      properties: {
        ecid: {
          type: "string",
          description: "玩家ECID",
          minLength: 1
        }
      },
      required: ["ecid"]
    }
  }
];

export async function handlePlayerTool(name, arguments_) {
  try {
    switch (name) {
      case "search_players":
        const searchResult = await playerAPI.searchPlayers(arguments_.name);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(searchResult, null, 2)
          }]
        };

      case "get_player_basic":
        const basicInfo = await playerAPI.getPlayerBasic(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(basicInfo, null, 2)
          }]
        };

      case "get_player_tickets":
        const tickets = await playerAPI.getPlayerTickets(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(tickets, null, 2)
          }]
        };

      case "get_player_logs":
        const logs = await playerAPI.getPlayerLogs(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(logs, null, 2)
          }]
        };

      case "get_player_bans":
        const bans = await playerAPI.getPlayerBans(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(bans, null, 2)
          }]
        };

      default:
        throw new Error(`Unknown player tool: ${name}`);
    }
  } catch (error) {
    return handleToolError(error);
  }
}