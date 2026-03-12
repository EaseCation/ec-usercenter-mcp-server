import express from "express";
import cors from "cors";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcp-server.js";

function jsonRpcError(res, status, message) {
  res.status(status).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message,
    },
    id: null,
  });
}

function hasValidBearerToken(req, expectedToken) {
  if (!expectedToken) {
    return true;
  }

  const forwardedToken = req.get("x-mcp-bearer-token");
  if (forwardedToken) {
    return forwardedToken === expectedToken;
  }

  const authorization = req.get("authorization");
  return authorization === `Bearer ${expectedToken}`;
}

export function createHttpApp({ config, fetchImpl } = {}) {
  const app = express();

  app.use(
    cors({
      origin: config.http.corsOrigin,
      exposedHeaders: ["Mcp-Session-Id"],
      allowedHeaders: ["Content-Type", "mcp-session-id"],
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/healthz", (_req, res) => {
    res.json({
      ok: true,
      service: config.serverInfo.name,
      version: config.serverInfo.version,
      transport: config.transport,
      enabledModes: config.enabledModes,
      mcpPath: config.http.path,
      authRequired: Boolean(config.http.bearerToken),
    });
  });

  app.get("/", (_req, res) => {
    res.json({
      service: config.serverInfo.name,
      version: config.serverInfo.version,
      status: "ready",
      transport: config.transport,
      mcpPath: config.http.path,
      healthPath: "/healthz",
      authRequired: Boolean(config.http.bearerToken),
    });
  });

  app.post(config.http.path, async (req, res) => {
    if (!hasValidBearerToken(req, config.http.bearerToken)) {
      jsonRpcError(res, 401, "Unauthorized");
      return;
    }

    let transport;
    let mcpServer;

    try {
      ({ server: mcpServer } = createMcpServer({ config, fetchImpl }));
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableDnsRebindingProtection: config.http.enableDnsRebindingProtection,
      });

      res.on("close", () => {
        transport.close().catch(() => {});
        mcpServer.close().catch(() => {});
      });

      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("处理 MCP HTTP 请求失败:", error);

      if (!res.headersSent) {
        jsonRpcError(res, 500, "Internal server error");
      }
    }
  });

  app.get(config.http.path, (_req, res) => {
    jsonRpcError(res, 405, "Method not allowed in stateless mode");
  });

  app.delete(config.http.path, (_req, res) => {
    jsonRpcError(res, 405, "Method not allowed in stateless mode");
  });

  return app;
}
