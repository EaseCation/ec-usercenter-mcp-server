import { authAPI } from '../api/auth-api.js';
import { handleToolError } from '../utils/errors.js';

export const authTools = [
  {
    name: "get_user_info",
    description: "获取当前登录用户信息和权限",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },

  {
    name: "check_staff_permission",
    description: "检查管理员权限（需要管理员Token）",
    inputSchema: {
      type: "object",
      properties: {
        authorizer: {
          type: "string",
          description: "授权人标识",
          minLength: 1
        }
      },
      required: ["authorizer"]
    }
  }
];

export async function handleAuthTool(name, arguments_) {
  try {
    switch (name) {
      case "get_user_info":
        const userInfo = await authAPI.getUserInfo();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(userInfo, null, 2)
          }]
        };

      case "check_staff_permission":
        const permission = await authAPI.checkStaffPermission(arguments_.authorizer);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(permission, null, 2)
          }]
        };

      default:
        throw new Error(`Unknown auth tool: ${name}`);
    }
  } catch (error) {
    return handleToolError(error);
  }
}