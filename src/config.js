import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import packageJson from "../package.json" with { type: "json" };
import { ConfigurationError } from "./utils/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  process.loadEnvFile?.(join(__dirname, "..", ".env"));
} catch {
}

function readBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function readInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePath(pathname) {
  if (!pathname) {
    return "/mcp";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function resolveConfig(env = process.env) {
  const sharedBaseUrl = env.EC_API_BASE_URL || "http://127.0.0.1:9000";
  const adminToken = env.EC_ADMIN_JWT_TOKEN || env.EC_JWT_TOKEN || "";
  const adminRefreshToken = env.EC_ADMIN_REFRESH_TOKEN || env.EC_JWT_REFRESH_TOKEN || "";
  const userToken = env.EC_USER_JWT_TOKEN || "";
  const userRefreshToken = env.EC_USER_REFRESH_TOKEN || "";
  const adminEnabled = readBoolean(env.EC_ENABLE_ADMIN_TOOLS, Boolean(adminToken || adminRefreshToken));
  const userEnabled = readBoolean(env.EC_ENABLE_USER_TOOLS, Boolean(userToken || userRefreshToken));
  const transport = env.MCP_TRANSPORT || "stdio";

  if (!adminEnabled && !userEnabled) {
    throw new ConfigurationError(
      "至少启用一种工具模式。请设置 EC_ENABLE_ADMIN_TOOLS=true 或 EC_ENABLE_USER_TOOLS=true，并提供对应 token。"
    );
  }

  if (!["stdio", "streamable-http"].includes(transport)) {
    throw new ConfigurationError(`不支持的 MCP_TRANSPORT: ${transport}`);
  }

  const serverInfo = {
    name: "ec-usercenter-mcp-server",
    version: packageJson.version,
  };

  const enabledModes = [];
  if (adminEnabled) {
    enabledModes.push("admin");
  }
  if (userEnabled) {
    enabledModes.push("user");
  }

  return {
    serverInfo,
    instructions:
      "优先使用 me_* 工具读取当前用户自己的账号和 ECID 数据；只有在明确需要管理员权限时才使用 admin_* 工具。读取类工具不会修改数据，admin_assign_ticket 会产生实际副作用。",
    apiTimeoutMs: readInteger(env.EC_API_TIMEOUT, 30_000),
    transport,
    enabledModes,
    modes: {
      admin: {
        enabled: adminEnabled,
        baseUrl: env.EC_ADMIN_API_BASE_URL || sharedBaseUrl,
        token: adminToken,
        refreshToken: adminRefreshToken,
      },
      user: {
        enabled: userEnabled,
        baseUrl: env.EC_USER_API_BASE_URL || sharedBaseUrl,
        token: userToken,
        refreshToken: userRefreshToken,
      },
    },
    http: {
      host: env.MCP_HTTP_HOST || (env.PORT ? "0.0.0.0" : "127.0.0.1"),
      port: readInteger(env.MCP_HTTP_PORT ?? env.PORT, 3100),
      path: normalizePath(env.MCP_HTTP_PATH),
      corsOrigin: env.MCP_HTTP_CORS_ORIGIN || "*",
      enableDnsRebindingProtection: readBoolean(env.MCP_HTTP_ENABLE_DNS_REBINDING_PROTECTION, false),
      bearerToken: env.MCP_HTTP_BEARER_TOKEN || "",
    },
  };
}

export const config = resolveConfig();
