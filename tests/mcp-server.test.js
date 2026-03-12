import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../src/mcp-server.js";

function createTestConfig() {
  return {
    serverInfo: {
      name: "ec-usercenter-mcp-server",
      version: "test",
    },
    instructions: "test",
    apiTimeoutMs: 1_000,
    transport: "stdio",
    enabledModes: ["admin", "user"],
    modes: {
      admin: {
        enabled: true,
        baseUrl: "http://localhost:9000",
        token: "admin-token",
        refreshToken: "admin-refresh-token",
      },
      user: {
        enabled: true,
        baseUrl: "http://localhost:9000",
        token: "user-token",
        refreshToken: "user-refresh-token",
      },
    },
    http: {
      host: "127.0.0.1",
      port: 3100,
      path: "/mcp",
      corsOrigin: "*",
      enableDnsRebindingProtection: false,
      bearerToken: "",
    },
  };
}

function createFetchMock() {
  return async (url, options = {}) => {
    const requestUrl = new URL(url);
    const method = (options.method || "GET").toUpperCase();
    const path = requestUrl.pathname;

    const payloads = {
      "GET /user/info": { EPF_code: 200, EPF_description: "成功", openid: "user-1", nickname: "土豆" },
      "GET /ec/list": [
        { ecid: "Shirova_", name: "Shirova" },
        { ecid: "EC20001", name: "Second" },
      ],
      "GET /ec/detail": { EPF_code: 200, EPF_description: "成功", data: { ecid: requestUrl.searchParams.get("ecid") } },
      "GET /ec/binding-info": { EPF_code: 200, EPF_description: "成功", data: { totalResults: 1 } },
      "GET /user/email-security": { EPF_code: 200, EPF_description: "成功", data: { email_enabled: true } },
      "GET /ticket/chooseList": { EPF_code: 200, EPF_description: "成功", data: [{ type: requestUrl.searchParams.get("type"), label: "示例" }] },
      "GET /ticket/adminRecruitmentTime": { EPF_code: 200, EPF_description: "成功", openTime: "2025-06-01T00:00:00Z", closeTime: "2025-07-31T23:59:59Z" },
      "GET /ticket/list": { EPF_code: 200, EPF_description: "成功", result: [{ tid: 1001 }] },
      "GET /ticket/count": { EPF_code: 200, EPF_description: "成功", data: { total: 3 } },
      "GET /ticket/detail": { EPF_code: 200, EPF_description: "成功", tid: Number(requestUrl.searchParams.get("tid")) },
      "GET /ec/search": [{ ecid: "Shirova_", name: requestUrl.searchParams.get("name") }],
      "GET /ec/scoretop": { EPF_code: 200, EPF_description: "成功", data: { sample: true } },
      "GET /ec/gift": { EPF_code: 200, EPF_description: "成功", data: { ecid: requestUrl.searchParams.get("ecid"), available: true } },
      "GET /user/console-player-url": { EPF_code: 200, EPF_description: "成功", url: `https://example.com/console/player/${requestUrl.searchParams.get("ecid")}` },
      "GET /year-summary": { EPF_code: 200, EPF_description: "成功", data: { year: 2025 } },
      "GET /staff/permission": { EPF_code: 200, EPF_description: "成功", data: { authorizer: requestUrl.searchParams.get("authorizer") } },
      "GET /ticket/query": { EPF_code: 200, EPF_description: "成功", result: [{ tid: 42 }] },
      "GET /ticket/adminMy": { EPF_code: 200, EPF_description: "成功", result: [{ tid: 7 }] },
      "GET /ticket/aiReply": { EPF_code: 200, EPF_description: "成功", data: { reply: "ok" } },
      "GET /ticket/assign": { EPF_code: 200, EPF_description: "成功", tid: 99 },
      "GET /ec/basic": { EPF_code: 200, EPF_description: "成功", data: { ecid: requestUrl.searchParams.get("ecid") } },
      "GET /ec/info": { EPF_code: 200, EPF_description: "成功", data: { ecid: requestUrl.searchParams.get("ecid"), full: true } },
      "GET /ec/tickets": { EPF_code: 200, EPF_description: "成功", result: [{ tid: 1 }] },
      "GET /ec/ticket-logs": { EPF_code: 200, EPF_description: "成功", result: [{ action: "check" }] },
      "GET /ec/ban": { EPF_code: 200, EPF_description: "成功", result: [] },
      "GET /ec/chat": { EPF_code: 200, EPF_description: "成功", result: [] },
      "GET /ec/auth": { EPF_code: 200, EPF_description: "成功", result: [] },
      "GET /ec/exchange": { EPF_code: 200, EPF_description: "成功", result: [] },
      "GET /ec/recording": { EPF_code: 200, EPF_description: "成功", result: [] },
      "GET /ec/merchandise": { EPF_code: 200, EPF_description: "成功", result: [] },
      "GET /ec/tasks": { EPF_code: 200, EPF_description: "成功", result: [] },
    };

    const key = `${method} ${path}`;
    const body = payloads[key];
    if (body === undefined) {
      return new Response(JSON.stringify({ EPF_code: 404, EPF_description: `Missing mock for ${key}` }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}

function createRefreshingFetchMock() {
  let refreshed = false;

  return async (url, options = {}) => {
    const requestUrl = new URL(url);
    const method = (options.method || "GET").toUpperCase();
    const path = requestUrl.pathname;
    const authHeader = options.headers?.Authorization || options.headers?.authorization || "";

    if (method === "POST" && path === "/user/refresh") {
      const body = JSON.parse(options.body ?? "{}");
      assert.equal(body.refresh_token, "user-refresh-token");
      refreshed = true;

      return new Response(JSON.stringify({ EPF_code: 200, token: "user-token-refreshed" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (method === "GET" && path === "/user/info") {
      if (!refreshed && authHeader === "Bearer expired-user-token") {
        return new Response(JSON.stringify({ EPF_code: 8003, EPF_description: "token expired" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        });
      }

      assert.equal(authHeader, "Bearer user-token-refreshed");
      return new Response(JSON.stringify({ EPF_code: 200, EPF_description: "成功", openid: "user-1" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ EPF_code: 404, EPF_description: `Missing mock for ${method} ${path}` }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  };
}

test("tools/list exposes admin and user tools", async () => {
  const { server } = createMcpServer({
    config: createTestConfig(),
    fetchImpl: createFetchMock(),
  });
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const tools = await client.listTools();
  const toolNames = tools.tools.map(tool => tool.name);

  assert(toolNames.includes("admin_query_tickets"));
  assert(toolNames.includes("me_get_account_overview"));
  assert(toolNames.includes("me_get_ticket_creation_context"));
  assert(toolNames.includes("me_get_console_player_url"));

  await server.close();
});

test("tool calls return structured content", async () => {
  const { server } = createMcpServer({
    config: createTestConfig(),
    fetchImpl: createFetchMock(),
  });
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const userResult = await client.callTool({ name: "me_get_account_overview", arguments: {} });
  assert.equal(userResult.structuredContent.mode, "user");
  assert.equal(userResult.structuredContent.data.ecids.length, 2);

  const contextResult = await client.callTool({
    name: "me_get_ticket_creation_context",
    arguments: { type: "COMPLAINT", ecid: "Shirova_" },
  });
  assert.equal(contextResult.structuredContent.mode, "user");
  assert.equal(contextResult.structuredContent.data.type, "COMPLAINT");
  assert.equal(contextResult.structuredContent.data.vipGiftStatus.data.available, true);

  const adminResult = await client.callTool({
    name: "admin_query_tickets",
    arguments: { page: 1, pageSize: 20 },
  });
  assert.equal(adminResult.structuredContent.mode, "admin");
  assert.equal(adminResult.structuredContent.data.result[0].tid, 42);

  await server.close();
});

test("expired access token is refreshed automatically", async () => {
  const config = createTestConfig();
  config.modes.user.token = "expired-user-token";
  const { server } = createMcpServer({
    config,
    fetchImpl: createRefreshingFetchMock(),
  });
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const result = await client.callTool({ name: "me_get_current_user", arguments: {} });
  assert.ok(!result.isError);
  assert.equal(result.structuredContent.data.openid, "user-1");

  await server.close();
});
