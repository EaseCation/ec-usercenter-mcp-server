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
  },

  {
    name: "get_player_chat_history",
    description: "获取指定玩家的聊天历史记录（需要管理员权限）",
    inputSchema: {
      type: "object",
      properties: {
        ecid: {
          type: "string",
          description: "玩家的ECID标识符",
          minLength: 1
        }
      },
      required: ["ecid"]
    }
  },

  {
    name: "get_player_info",
    description: "获取玩家全部信息（需要管理员权限）",
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
    name: "get_player_auth_history",
    description: "获取玩家认证历史记录（需要管理员权限）",
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
    name: "get_player_exchange_log",
    description: "获取玩家兑换（购买、交易、抽奖）记录（需要管理员权限）",
    inputSchema: {
      type: "object",
      properties: {
        ecid: {
          type: "string",
          description: "玩家ECID",
          minLength: 1
        },
        from: {
          type: "string",
          description: "开始时间 (YYYY-MM-DD HH:mm:ss)"
        },
        to: {
          type: "string",
          description: "结束时间 (YYYY-MM-DD HH:mm:ss)"
        }
      },
      required: ["ecid"]
    }
  },

  {
    name: "get_player_recording_history",
    description: "获取玩家录像历史记录（需要管理员权限）",
    inputSchema: {
      type: "object",
      properties: {
        ecid: {
          type: "string",
          description: "玩家ECID",
          minLength: 1
        },
        startTime: {
          type: "string",
          description: "开始日期 (YYYY-MM-DD)"
        },
        endTime: {
          type: "string",
          description: "结束日期 (YYYY-MM-DD)"
        }
      },
      required: ["ecid"]
    }
  },

  {
    name: "get_player_merchandise",
    description: "获取玩家商品数据（需要管理员权限）",
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
    name: "get_player_tasks",
    description: "获取玩家任务数据（需要管理员权限）",
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

      case "get_player_chat_history":
        const chatHistory = await playerAPI.getPlayerChatHistory(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(chatHistory, null, 2)
          }]
        };

      case "get_player_info":
        const playerInfo = await playerAPI.getPlayerInfo(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(playerInfo, null, 2)
          }]
        };

      case "get_player_auth_history":
        const authHistory = await playerAPI.getPlayerAuthHistory(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(authHistory, null, 2)
          }]
        };

      case "get_player_exchange_log":
        const exchangeLog = await playerAPI.getPlayerExchangeLog(arguments_.ecid, arguments_.from, arguments_.to);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(exchangeLog, null, 2)
          }]
        };

      case "get_player_recording_history":
        const recordingHistory = await playerAPI.getPlayerRecordingHistory(arguments_.ecid, arguments_.startTime, arguments_.endTime);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(recordingHistory, null, 2)
          }]
        };

      case "get_player_merchandise":
        const merchandise = await playerAPI.getPlayerMerchandise(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(merchandise, null, 2)
          }]
        };

      case "get_player_tasks":
        const tasks = await playerAPI.getPlayerTasks(arguments_.ecid);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(tasks, null, 2)
          }]
        };

      default:
        throw new Error(`Unknown player tool: ${name}`);
    }
  } catch (error) {
    return handleToolError(error);
  }
}