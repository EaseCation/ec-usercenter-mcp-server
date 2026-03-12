#!/usr/bin/env node

import { readFile } from "node:fs/promises";

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) {
    return null;
  }

  return process.argv[index + 1];
}

function normalizeBaseUrl(url) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return `https://${url}`;
}

async function resolveBaseUrl() {
  const directUrl = getArg("--url");
  if (directUrl) {
    return normalizeBaseUrl(directUrl);
  }

  const infoPath = getArg("--info");
  if (!infoPath) {
    throw new Error("请通过 --url 或 --info 提供函数地址。");
  }

  const info = JSON.parse(await readFile(infoPath, "utf8"));
  return normalizeBaseUrl(info?.url?.system_url || info?.url?.custom_domain);
}

function getBearerToken() {
  return getArg("--bearer") || process.env.MCP_HTTP_BEARER_TOKEN || "";
}

function parseMcpResponse(text, contentType) {
  if ((contentType || "").includes("text/event-stream")) {
    const payloads = text
      .split("\n")
      .filter(line => line.startsWith("data:"))
      .map(line => line.slice(5).trim())
      .filter(Boolean);

    if (payloads.length === 0) {
      throw new Error("MCP SSE 响应中没有 data payload。");
    }

    return JSON.parse(payloads.at(-1));
  }

  return JSON.parse(text);
}

async function callJsonRpc(endpoint, method, params, bearerToken) {
  const headers = {
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
  };

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
    headers["X-Mcp-Bearer-Token"] = bearerToken;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${method}-${Date.now()}`,
      method,
      params,
    }),
  });

  const text = await response.text();
  let body = text;
  try {
    body = parseMcpResponse(text, response.headers.get("content-type"));
  } catch {
  }

  if (!response.ok) {
    throw new Error(`${method} 失败 (${response.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }

  if (typeof body === "string") {
    throw new Error(`${method} 返回了非 JSON 响应。`);
  }

  if (body.error) {
    throw new Error(`${method} 返回错误: ${body.error.message || JSON.stringify(body.error)}`);
  }

  return body.result;
}

async function main() {
  const baseUrl = await resolveBaseUrl();
  if (!baseUrl) {
    throw new Error("无法从部署信息中解析函数地址。");
  }

  const path = getArg("--path") || "/mcp";
  const bearerToken = getBearerToken();
  const endpoint = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();

  const capabilities = await callJsonRpc(
    endpoint,
    "resources/read",
    { uri: "ec-usercenter://capabilities" },
    bearerToken
  );
  const toolsResult = await callJsonRpc(endpoint, "tools/list", {}, bearerToken);
  const toolNames = (toolsResult?.tools || []).map(tool => tool.name);

  let verificationTool = null;
  if (toolNames.includes("me_get_current_user")) {
    verificationTool = "me_get_current_user";
    await callJsonRpc(endpoint, "tools/call", { name: verificationTool, arguments: {} }, bearerToken);
  } else if (toolNames.includes("admin_get_current_user")) {
    verificationTool = "admin_get_current_user";
    await callJsonRpc(endpoint, "tools/call", { name: verificationTool, arguments: {} }, bearerToken);
  }

  console.log(
    JSON.stringify(
      {
        endpoint,
        authRequired: Boolean(bearerToken),
        capabilityResource: capabilities?.contents?.[0]?.uri || null,
        toolCount: toolNames.length,
        verificationTool,
      },
      null,
      2
    )
  );
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
