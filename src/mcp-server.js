import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { UserCenterAPIClient } from "./api/client.js";
import { adminTools } from "./toolsets/admin-tools.js";
import { userTools } from "./toolsets/user-tools.js";
import { createToolError } from "./utils/errors.js";

function registerTools(server, tools, apiClient, registeredTools) {
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        annotations: tool.annotations,
      },
      async args => {
        try {
          return await tool.run(apiClient, args);
        } catch (error) {
          return createToolError(error);
        }
      }
    );

    registeredTools.push({
      name: tool.name,
      title: tool.title,
      mode: tool.mode,
      description: tool.description,
    });
  }
}

function createClients(config, fetchImpl) {
  const clients = {};

  if (config.modes.admin.enabled) {
    clients.admin = new UserCenterAPIClient({
      mode: "admin",
      baseUrl: config.modes.admin.baseUrl,
      token: config.modes.admin.token,
      refreshToken: config.modes.admin.refreshToken,
      timeoutMs: config.apiTimeoutMs,
      fetchImpl,
    });
  }

  if (config.modes.user.enabled) {
    clients.user = new UserCenterAPIClient({
      mode: "user",
      baseUrl: config.modes.user.baseUrl,
      token: config.modes.user.token,
      refreshToken: config.modes.user.refreshToken,
      timeoutMs: config.apiTimeoutMs,
      fetchImpl,
    });
  }

  return clients;
}

export function createMcpServer({ config, fetchImpl } = {}) {
  const clients = createClients(config, fetchImpl);
  const server = new McpServer(config.serverInfo, {
    instructions: config.instructions,
  });
  const registeredTools = [];

  if (clients.admin) {
    registerTools(server, adminTools, clients.admin, registeredTools);
  }

  if (clients.user) {
    registerTools(server, userTools, clients.user, registeredTools);
  }

  server.registerResource(
    "capabilities",
    "ec-usercenter://capabilities",
    {
      title: "服务器能力说明",
      description: "显示当前启用的管理员态/用户态工具与接入配置。",
      mimeType: "application/json",
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              server: config.serverInfo,
              enabledModes: config.enabledModes,
              transport: config.transport,
              tools: registeredTools,
              endpoints: {
                admin: config.modes.admin.enabled ? config.modes.admin.baseUrl : null,
                user: config.modes.user.enabled ? config.modes.user.baseUrl : null,
              },
            },
            null,
            2
          ),
        },
      ],
    })
  );

  return {
    server,
    clients,
    registeredTools,
  };
}
