#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config.js";
import { createHttpApp } from "./http-server.js";
import { createMcpServer } from "./mcp-server.js";
import { ConfigurationError } from "./utils/errors.js";

async function main() {
  if (config.transport === "streamable-http") {
    const app = createHttpApp({ config });

    app.listen(config.http.port, config.http.host, error => {
      if (error) {
      console.error("MCP HTTP 服务启动失败:", error);
        process.exit(1);
      }

      console.error(
        `MCP Streamable HTTP 已启动: http://${config.http.host}:${config.http.port}${config.http.path}${
          config.http.bearerToken ? " (bearer auth enabled)" : ""
        }`
      );
    });
    return;
  }

  const { server } = createMcpServer({ config });
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

process.on("unhandledRejection", error => {
  console.error("未处理的 Promise 异常:", error);
});

main().catch(error => {
  if (error instanceof ConfigurationError) {
    console.error("配置错误:", error.message);
    process.exit(1);
  }

  console.error("MCP 服务启动失败:", error);
  process.exit(1);
});
