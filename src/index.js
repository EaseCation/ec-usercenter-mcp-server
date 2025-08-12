#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { config } from './config.js';
import { ticketTools, handleTicketTool } from './tools/ticket-tools.js';
import { playerTools, handlePlayerTool } from './tools/player-tools.js';
import { authTools, handleAuthTool } from './tools/auth-tools.js';

class ECUserCenterMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: config.serverName,
        version: config.serverVersion,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = [
        ...ticketTools,
        ...playerTools,
        ...authTools
      ];

      return {
        tools: allTools
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Determine which handler to use based on tool name
      if (ticketTools.some(tool => tool.name === name)) {
        return await handleTicketTool(name, args || {});
      }
      
      if (playerTools.some(tool => tool.name === name)) {
        return await handlePlayerTool(name, args || {});
      }
      
      if (authTools.some(tool => tool.name === name)) {
        return await handleAuthTool(name, args || {});
      }

      // Unknown tool
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Unknown tool: ${name}`
        }]
      };
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}

// Error handling for configuration
process.on('uncaughtException', (error) => {
  if (error.message.includes('Configuration validation failed')) {
    console.error('配置错误:', error.message);
    console.error('请检查环境变量设置，确保 EC_JWT_TOKEN 和 EC_API_BASE_URL 已正确配置');
    process.exit(1);
  }
  throw error;
});

// Start the server
const server = new ECUserCenterMCPServer();
server.run().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});